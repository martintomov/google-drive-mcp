import { mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { homedir } from 'os';

/**
 * Manages temporary directories for PDF processing
 * Uses ~/.config/google-drive-mcp/temp/ for temp storage
 */
export class TempManager {
  private tempBaseDir: string;

  constructor() {
    // Use XDG Base Directory specification
    this.tempBaseDir = join(homedir(), '.config', 'google-drive-mcp', 'temp');
  }

  /**
   * Creates a unique temporary directory with the given prefix
   * @param prefix Prefix for the temp directory name (e.g., 'pdf-split')
   * @returns Absolute path to the created temp directory
   */
  async createTempDir(prefix: string): Promise<string> {
    // Ensure base temp directory exists
    if (!existsSync(this.tempBaseDir)) {
      await mkdir(this.tempBaseDir, { recursive: true });
    }

    // Create unique directory name using timestamp and random string
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const dirName = `${prefix}-${timestamp}-${random}`;
    const tempDir = join(this.tempBaseDir, dirName);

    // Create the directory
    await mkdir(tempDir, { recursive: true });

    return tempDir;
  }

  /**
   * Recursively deletes a temporary directory and all its contents
   * @param dirPath Path to the directory to delete
   */
  async cleanup(dirPath: string): Promise<void> {
    try {
      if (existsSync(dirPath)) {
        await rm(dirPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`Failed to cleanup temp directory ${dirPath}:`, error);
      // Don't throw - cleanup failures shouldn't break the main operation
    }
  }

  /**
   * Cleans up old temp directories (older than 24 hours)
   * This can be called periodically to prevent temp directory buildup
   */
  async cleanupOld(): Promise<void> {
    try {
      if (!existsSync(this.tempBaseDir)) {
        return;
      }

      const { readdir, stat } = await import('fs/promises');
      const entries = await readdir(this.tempBaseDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const entry of entries) {
        const entryPath = join(this.tempBaseDir, entry);
        try {
          const stats = await stat(entryPath);
          if (stats.isDirectory() && (now - stats.mtimeMs) > maxAge) {
            await this.cleanup(entryPath);
          }
        } catch (error) {
          // Ignore errors for individual entries
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old temp directories:', error);
    }
  }
}

// Export singleton instance
export const tempManager = new TempManager();
