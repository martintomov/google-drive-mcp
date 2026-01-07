import io
import os
import sys

# This will trigger the unimasters ENCODING error on linux 
# os.environ["PYTHONIOENCODING"] = "cp1252"
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='cp1252', errors='strict')
# sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='cp1252', errors='strict')

# Encoding fixes on non POSIX systems
os.environ["PYTHONIOENCODING"] = "utf8"
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf8', errors='strict')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf8', errors='strict')

# DOCS for errors='strict' from : https://docs.python.org/3/library/io.html

from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PyPDF2 import PdfReader
from PIL import Image
# import fitz  # PyMuPDF

def add_page_numbers(input_pdf, output_pdf):
    """
    Add page numbers to a PDF file and save it as a new PDF.
    
    Args:
        input_pdf (str): Path to the input PDF file
        output_pdf (str): Path to the output PDF file
    """
    reader = PdfReader(input_pdf)
    writer = PdfWriter()
    
    # Loop over each page to add page numbers
    for i, page in enumerate(reader.pages):
        packet = io.BytesIO()
        # Create a canvas with the same page size as your PDF (here using letter size)
        can = canvas.Canvas(packet, pagesize=letter)
        
        # Draw the page number at desired position (adjust coordinates as needed)
        page_number = str(i+1)
        can.drawString(500, 10, page_number)
        can.save()
        
        # Move to the beginning of the StringIO buffer
        packet.seek(0)
        watermark = PdfReader(packet)
        
        # Merge the watermark (with the page number) with the original page
        watermark_page = watermark.pages[0]
        page.merge_page(watermark_page)
        writer.add_page(page)

    # Write the modified PDF to a file
    with open(output_pdf, "wb") as out_file:
        writer.write(out_file)
        
    print(f"Output saved to {output_pdf}")
    return output_pdf

def extract_pdf_pages(input_file, start_page, end_page, output_file=None):
    """
    Extract pages from a PDF file and save them as a new PDF.
    
    Args:
        input_file (str): Path to the input PDF file
        start_page (int): Starting page number (1-based index)
        end_page (int): Ending page number (1-based index)
        output_file (str, optional): Path to the output PDF file.
                                    If not provided, will use the input filename with a suffix.
    
    Returns:
        str: Path to the saved output file
    """
    # Validate input parameters
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")
    
    if start_page < 1:
        raise ValueError("Start page must be at least 1")
    
    # Generate default output filename if not provided
    if output_file is None:
        input_filename = os.path.basename(input_file)
        input_dir = os.path.dirname(input_file)
        name_without_ext = os.path.splitext(input_filename)[0]
        output_file = os.path.join(input_dir, f"{name_without_ext}_pages_{start_page}_to_{end_page}.pdf")
    
    # Convert 1-based page numbers to 0-based indices for PyPDF2
    start_idx = start_page - 1
    end_idx = end_page - 1
    
    # Create PDF reader and writer objects
    reader = PdfReader(input_file)
    writer = PdfWriter()
    
    # Validate page range
    total_pages = len(reader.pages)
    if start_idx >= total_pages or end_idx >= total_pages:
        raise ValueError(f"Invalid page range: PDF has {total_pages} pages, requested {start_page} to {end_page}")
    
    if end_idx < start_idx:
        raise ValueError("End page must be greater than or equal to start page")
    
    # Extract the specified pages
    for i in range(start_idx, end_idx + 1):
        writer.add_page(reader.pages[i])
    
    # Write the extracted pages to the output file
    with open(output_file, "wb") as out_file:
        writer.write(out_file)
    
    return output_file

def extract_multiple_pdf_pages(input_file, output_path, start_pages, end_pages, output_titles=None):
    """
    Extract multiple sets of pages from a PDF file and save them as new PDFs.
    Each extracted PDF is saved as an individual file in the same directory as the input PDF.
    
    Args:
        input_file (str): Path to the input PDF file
        start_pages (list): List of starting page numbers (1-based index)
        end_pages (list): List of ending page numbers (1-based index)
        output_titles (list, optional): List of titles for the output PDFs.
                                       If not provided, will use default naming.
    
    Returns:
        list: Paths to the saved output files
    """
    # Validate input parameters
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")
    
    if len(start_pages) != len(end_pages):
        raise ValueError("Number of start pages must match number of end pages")
    
    if output_titles is not None and len(output_titles) != len(start_pages):
        raise ValueError("Number of output titles must match number of page ranges")
    
    # Get input file info for default output names
    input_filename = os.path.basename(input_file)
    
    output_dir = os.path.dirname(input_file)
    # if output_path is not None:
    if isinstance(output_path, str) and output_path.strip() != '':
        output_dir = output_path
        
    name_without_ext = os.path.splitext(input_filename)[0]
    
    # Create PDF reader
    reader = PdfReader(input_file)
    total_pages = len(reader.pages)
    
    # Store output paths
    output_files = []
    
    # Process each extraction
    for i, (start_page, end_page) in enumerate(zip(start_pages, end_pages)):
        # Validate page range
        if start_page < 1:
            raise ValueError(f"Start page {start_page} must be at least 1")
            
        # Convert 1-based page numbers to 0-based indices for PyPDF2
        start_idx = start_page - 1
        end_idx = end_page - 1
        
        if start_idx >= total_pages or end_idx >= total_pages:
            raise ValueError(f"Invalid page range: PDF has {total_pages} pages, requested {start_page} to {end_page}")
        
        if end_idx < start_idx:
            raise ValueError(f"End page {end_page} must be greater than or equal to start page {start_page}")
        
        # Determine output filename
        if output_titles is not None and i < len(output_titles):
            # Use provided title
            output_file = os.path.join(output_dir, f"{output_titles[i]}.pdf")
        else:
            # Use default naming
            output_file = os.path.join(output_dir, f"{name_without_ext}_pages_{start_page}_to_{end_page}.pdf")
        
        # Create writer for this extraction
        writer = PdfWriter()
        
        # Extract the specified pages
        for j in range(start_idx, end_idx + 1):
            writer.add_page(reader.pages[j])
        
        # Write the extracted pages to the output file
        with open(output_file, "wb") as out_file:
            writer.write(out_file)
        
        output_files.append(output_file)
        print(f"Extracted pages {start_page} to {end_page} saved to: {output_file}")
    
    return output_files

# def pdf_to_images(input_pdf_path, dpi=200):
#     """
#     Extract each page of a PDF as an image and save to a directory.
    
#     Parameters:
#         input_pdf_path (str): Path to the input PDF.
#         dpi (int): Resolution (dots per inch) for rendering. Default is 200.
#     """
#     # Check if input file exists
#     if not os.path.exists(input_pdf_path):
#         print(f"Error: Input file '{input_pdf_path}' not found.")
#         return
    
#     try:
#         # Get PDF base name without extension
#         pdf_basename = os.path.splitext(os.path.basename(input_pdf_path))[0]
        
#         # Create output directory with the name of the PDF
#         output_dir = os.path.join(os.path.dirname(input_pdf_path), pdf_basename)
#         if not os.path.exists(output_dir):
#             os.makedirs(output_dir)
            
#         # Open the PDF with PyMuPDF
#         pdf_document = fitz.open(input_pdf_path)
        
#         # Process each page
#         for page_num in range(len(pdf_document)):
#             # Get the page
#             page = pdf_document[page_num]
            
#             # Set the rendering matrix for the desired DPI
#             # 72 points per inch default zoom, so scale_factor is dpi / 72
#             zoom = dpi / 72
#             mat = fitz.Matrix(zoom, zoom)
            
#             # Render page to an image (pixmap)
#             pixmap = page.get_pixmap(matrix=mat, alpha=False)
            
#             # Convert to PIL Image
#             img = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
            
#             # Save image to file with page number
#             output_image_path = os.path.join(output_dir, f"{page_num + 1}.jpg")
#             img.save(output_image_path, "JPEG", quality=95)
            
#             print(f"Saved page {page_num + 1} as {output_image_path}")
        
#         print(f"Successfully extracted all pages to {output_dir}")
        
#     except Exception as e:
#         print(f"Error processing PDF: {e}")


def main():
    """
    Main function to handle command line arguments and call appropriate PDF processing functions.
    """
    if len(sys.argv) < 2:
        print("Usage:")
        print("For adding page numbers: python pdf-processor.py addpages input_pdf [output_pdf]")
        print("For extracting pages: python pdf-processor.py extract input_pdf start_page end_page [output_pdf]")
        print("For extracting multiple page ranges: python pdf-processor.py extract-multi input_pdf count start1 end1 [title1] start2 end2 [title2] ...")
        print("For converting PDF to images: python pdf-processor.py toimages input_pdf [dpi]")
        return

    command = sys.argv[1].lower()

    try:
        if command == "addpages" and len(sys.argv) >= 3:
            input_pdf = sys.argv[2]
            
            # Check if output file is provided
            if len(sys.argv) >= 4:
                output_pdf = sys.argv[3]
            else:
                # Create default output filename
                output_pdf = input_pdf.replace(".pdf", "-with_page_numbers.pdf")
                if output_pdf == input_pdf:  # If no .pdf in filename
                    output_pdf = input_pdf + "_with_page_numbers.pdf"
            
            print(f"Adding page numbers to {input_pdf}")
            result = add_page_numbers(input_pdf, output_pdf)
            print(f"Added page numbers. Output saved to: {result}")
            
        # elif command == "extract" and len(sys.argv) >= 5:
        #     input_pdf = sys.argv[2]
            
        #     try:
        #         start_page = int(sys.argv[3])
        #         end_page = int(sys.argv[4])
        #     except ValueError:
        #         print("Error: Page numbers must be integers")
        #         return
                
        #     # Check if output file is provided
        #     output_pdf = None
        #     if len(sys.argv) >= 6:
        #         output_pdf = sys.argv[5]
            
        #     print(f"Extracting pages {start_page} to {end_page} from {input_pdf}")
        #     result = extract_pdf_pages(input_pdf, start_page, end_page, output_pdf)
        #     print(f"Extracted pages saved to: {result}")
        
        elif command == "extract" and len(sys.argv) >= 5:
            
            input_pdf = sys.argv[2]
            output_path = sys.argv[3]
            
            try:
                # Get number of extractions
                num_extractions = int(sys.argv[4])
                
                # Ensure we have enough arguments
                min_required_args = 5 + (num_extractions * 2)  # command, input_pdf, count, plus start/end for each extraction
                if len(sys.argv) < min_required_args:
                    print(f"Error: Not enough arguments for {num_extractions} extractions")
                    return
                
                # Parse start and end pages and optional titles
                start_pages = []
                end_pages = []
                output_titles = []
                
                arg_index = 5  # Starting index for extraction parameters
                for i in range(num_extractions):
                    # Get start and end pages
                    if arg_index + 1 >= len(sys.argv):
                        print(f"Error: Missing page numbers for extraction {i+1}")
                        return
                    
                    start_pages.append(int(sys.argv[arg_index]))
                    end_pages.append(int(sys.argv[arg_index + 1]))
                    arg_index += 2
                    
                    # Check if title is provided for this extraction
                    if arg_index < len(sys.argv) and not sys.argv[arg_index].isdigit():
                        output_titles.append(sys.argv[arg_index])
                        arg_index += 1
                    else:
                        output_titles.append(None)
                
                # Filter out None values from output_titles
                if all(title is None for title in output_titles):
                    output_titles = None
                
                print(f"Extracting multiple page ranges from {input_pdf}")
                results = extract_multiple_pdf_pages(input_pdf, output_path, start_pages, end_pages, output_titles)
                print(f"Successfully extracted {len(results)} PDF files")
                
            except ValueError as e:
                print(f"Error parsing extraction parameters: {str(e)}")
                return
            
        # elif command == "toimages" and len(sys.argv) >= 3:
        #     input_pdf = sys.argv[2]
            
        #     # Check if DPI is provided
        #     dpi = 200  # Default DPI
        #     if len(sys.argv) >= 4:
        #         try:
        #             dpi = int(sys.argv[3])
        #         except ValueError:
        #             print("Error: DPI must be an integer, using default value of 200")
            
        #     print(f"Converting PDF to images: {input_pdf} with DPI {dpi}")
        #     pdf_to_images(input_pdf, dpi)
            
        else:
            print("Invalid command or missing arguments")
            
    except FileNotFoundError as e:
        print(f"Error: {str(e)}")
    except ValueError as e:
        print(f"Error: {str(e)}")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    main()



# Example usage for pdf_to_images function
# if __name__ == "__main__":

#     # Test the extract_multiple_pdf_pages functionality
#     def test_extract_multiple_pdf_pages():
#         try:
#             # Get the current directory where the script is located
#             current_dir = os.path.dirname(os.path.abspath(__file__))
            
#             # Path to the test PDF file
#             # input_pdf = os.path.join(current_dir, "testDoc-output_with_page_numbers.pdf")
#             input_pdf = "C:/Users/simeo/Downloads/738-01555665.pdf"
            
#             if not os.path.exists(input_pdf):
#                 print(f"Test PDF file not found: {input_pdf}")
#                 return
            
#             # Define multiple page ranges to extract
#             start_pages = [1, 3, 5]
#             end_pages = [2, 4, 5]
            
#             # Define custom output titles for the extracted PDFs
#             output_titles = ["Pages_1_2", "Pages_3_4", "Pages_5"]
            
#             print(f"Testing extract_multiple_pdf_pages with {input_pdf}")
#             print(f"Extracting page ranges: {list(zip(start_pages, end_pages))}")
            
#             # Call the function to extract multiple page ranges
#             results = extract_multiple_pdf_pages(input_pdf, start_pages, end_pages, output_titles)
            
#             # Print the results
#             print(f"Successfully extracted {len(results)} PDF files:")
#             for i, result in enumerate(results):
#                 print(f"  {i+1}. {result}")
            
#             # Test without custom titles (using default naming)
#             print("\nTesting with default naming:")
#             results_default = extract_multiple_pdf_pages(input_pdf, [9, 11], [10, 12])
#             for result in results_default:
#                 print(f"  {result}")
            
#             return results
        
#         except Exception as e:
#             print(f"Error testing extract_multiple_pdf_pages: {str(e)}")
#             return None
    
#     # Run the test function
#     test_extract_multiple_pdf_pages()


    # current_dir = os.path.dirname(os.path.abspath(__file__))
    # input_pdf = os.path.join(current_dir, "testDoc-output_with_page_numbers.pdf")
    
    # pdf_to_images(input_pdf, dpi=200)


# if len(sys.argv) == 1:
#     print("Provide a file path to read")
#     exit()

# input_pdf = sys.argv[1] 
# input_pdf = "C:/Users/simeo/LLM_Project/LLM-Canvas-Node-System/python_projects/unimasters/testDoc.pdf"
# output_pdf = input_pdf.replace(".pdf", "-output_with_page_numbers.pdf")
# add_page_numbers(input_pdf, output_pdf)

# Example usage of the extract_pdf_pages function:
# Extract pages in different ranges
# extracted_pdf1 = extract_pdf_pages(
#     input_file=output_pdf,
#     start_page=3,
#     end_page=4
# )
# print(f"Extracted pages 3-4 saved to: {extracted_pdf1}")

# extracted_pdf2 = extract_pdf_pages(
#     input_file=output_pdf,
#     start_page=5,
#     end_page=6
# )
# print(f"Extracted pages 5-6 saved to: {extracted_pdf2}")

# extracted_pdf3 = extract_pdf_pages(
#     input_file=output_pdf,
#     start_page=7,
#     end_page=8
# )
# print(f"Extracted pages 7-8 saved to: {extracted_pdf3}")

# extracted_pdf4 = extract_pdf_pages(
#     input_file=output_pdf,
#     start_page=9,
#     end_page=10
# )
# print(f"Extracted pages 9-10 saved to: {extracted_pdf4}")
