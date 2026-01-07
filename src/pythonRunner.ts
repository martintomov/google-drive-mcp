import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PythonResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Runs a Python script with the given arguments
 * @param scriptPath Absolute path to the Python script
 * @param args Array of command-line arguments
 * @param options Optional configuration
 * @returns Result containing stdout, stderr, and exit code
 */
export async function runPythonScript(
  scriptPath: string,
  args: string[],
  options?: { cwd?: string; timeout?: number }
): Promise<PythonResult> {
  return new Promise((resolve, reject) => {
    const timeout = options?.timeout || 5 * 60 * 1000; // Default 5 minutes
    let timeoutId: NodeJS.Timeout;

    const pythonProcess = spawn('python3', [scriptPath, ...args], {
      cwd: options?.cwd,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (exitCode) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: exitCode || 0
      });
    });

    pythonProcess.on('error', (error) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      reject(new Error(`Failed to execute Python script: ${error.message}`));
    });

    // Set timeout
    timeoutId = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error(`Python script timed out after ${timeout}ms`));
    }, timeout);
  });
}

interface PdfRange {
  start: number;
  end: number;
  title?: string;
}

/**
 * Splits a PDF into multiple files based on page ranges
 * @param inputPath Absolute path to the input PDF file
 * @param outputDir Directory where split PDFs will be saved
 * @param ranges Array of page ranges to extract
 * @returns Array of output file paths
 */
export async function splitPdf(
  inputPath: string,
  outputDir: string,
  ranges: PdfRange[]
): Promise<string[]> {
  if (!existsSync(inputPath)) {
    throw new Error(`Input PDF file not found: ${inputPath}`);
  }

  if (!existsSync(outputDir)) {
    throw new Error(`Output directory not found: ${outputDir}`);
  }

  // Get path to pdf-processor.py
  const scriptPath = join(__dirname, '..', 'python-scripts', 'pdf-processor.py');
  if (!existsSync(scriptPath)) {
    throw new Error(`Python script not found at: ${scriptPath}`);
  }

  // Build arguments for pdf-processor.py
  // Format: python pdf-processor.py extract input.pdf output_dir count start1 end1 [title1] start2 end2 [title2] ...
  const args = ['extract', inputPath, outputDir, ranges.length.toString()];

  for (const range of ranges) {
    args.push(range.start.toString());
    args.push(range.end.toString());
    if (range.title) {
      args.push(range.title);
    }
  }

  try {
    const result = await runPythonScript(scriptPath, args, {
      timeout: 10 * 60 * 1000 // 10 minutes for large PDFs
    });

    if (result.exitCode !== 0) {
      throw new Error(
        `PDF split failed with exit code ${result.exitCode}\n` +
        `stderr: ${result.stderr}\n` +
        `stdout: ${result.stdout}`
      );
    }

    // Parse output to get list of created files
    // pdf-processor.py prints each output file path on a new line
    const outputFiles = result.stdout
      .split('\n')
      .filter(line => line.trim() && existsSync(line.trim()))
      .map(line => line.trim());

    // If stdout parsing fails, fallback to scanning output directory
    if (outputFiles.length === 0) {
      const files = readdirSync(outputDir)
        .filter(file => file.endsWith('.pdf'))
        .map(file => join(outputDir, file))
        .filter(path => statSync(path).isFile());

      return files.sort(); // Sort for consistent ordering
    }

    return outputFiles;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to split PDF: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Splits a PDF into individual pages
 * @param inputPath Absolute path to the input PDF file
 * @param outputDir Directory where split PDFs will be saved
 * @returns Array of output file paths (one per page)
 */
export async function splitPdfIntoPages(
  inputPath: string,
  outputDir: string
): Promise<string[]> {
  // First, we need to determine the total number of pages
  // We'll use PyPDF2 via a simple Python script
  const getPageCountScript = join(__dirname, '..', 'python-scripts', 'pdf-processor.py');

  if (!existsSync(inputPath)) {
    throw new Error(`Input PDF file not found: ${inputPath}`);
  }

  // Get page count first by attempting to read the PDF with PyPDF2
  // The pdf-processor.py doesn't have a page count command, so we'll infer from output
  // or create ranges for common page counts

  // For now, let's try a different approach: create one range per page
  // We'll use PyPDF2 to detect page count
  const countScriptPath = join(__dirname, '..', 'python-scripts', 'pdf-processor.py');

  // Create a temporary script to count pages
  const { writeFileSync } = await import('fs');
  const tempCountScript = join(outputDir, '_count_pages.py');

  const countScriptContent = `#!/usr/bin/env python3
import sys
from PyPDF2 import PdfReader

if len(sys.argv) != 2:
    print("Usage: count_pages.py <pdf_file>")
    sys.exit(1)

try:
    reader = PdfReader(sys.argv[1])
    print(len(reader.pages))
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
`;

  writeFileSync(tempCountScript, countScriptContent);

  try {
    const countResult = await runPythonScript(tempCountScript, [inputPath]);

    if (countResult.exitCode !== 0) {
      throw new Error(`Failed to count PDF pages: ${countResult.stderr}`);
    }

    const pageCount = parseInt(countResult.stdout.trim(), 10);

    if (isNaN(pageCount) || pageCount <= 0) {
      throw new Error(`Invalid page count: ${countResult.stdout}`);
    }

    // Create ranges for each individual page
    const ranges: PdfRange[] = [];
    for (let i = 1; i <= pageCount; i++) {
      ranges.push({
        start: i,
        end: i,
        title: `page_${i}`
      });
    }

    // Now split using the ranges
    return await splitPdf(inputPath, outputDir, ranges);
  } finally {
    // Cleanup temp script
    try {
      const { unlinkSync } = await import('fs');
      if (existsSync(tempCountScript)) {
        unlinkSync(tempCountScript);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}
