import pdfplumber
import json
import os

pdf_path = r"d:\T-SHEET\uploads\III SEM T SHEET.pdf"

def inspect_pdf(path):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    with pdfplumber.open(path) as pdf:
        print(f"Total Pages: {len(pdf.pages)}")
        
        # Inspect first page
        first_page = pdf.pages[0]
        text = first_page.extract_text()
        if text:
            with open("inspect_output.txt", "w", encoding="utf-8") as f:
                f.write(text)
            print("\nFull text written to inspect_output.txt")
        else:
            print("No text extracted")
        
        print("\n--- First Page Table Detection ---")
        tables = first_page.extract_tables()
        print(f"Tables found: {len(tables)}")
        
        if tables:
            for i, table in enumerate(tables):
                print(f"\nTable {i} (First 3 rows):")
                for row in table[:3]:
                    print(row)
        else:
            # Try settings adjustments if no table found
            print("No tables found with default settings. Trying find_tables...")
            found_tables = first_page.find_tables()
            print(f"Found {len(found_tables)} tables using find_tables.")

if __name__ == "__main__":
    inspect_pdf(pdf_path)
