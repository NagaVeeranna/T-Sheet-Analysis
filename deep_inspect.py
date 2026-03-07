import pdfplumber
import pandas as pd

pdf_path = r"d:\T-SHEET\III SEM T SHEET.pdf"

with pdfplumber.open(pdf_path) as pdf:
    # Look at the first 50 rows of the first page to understand the flow
    page = pdf.pages[0]
    table = page.extract_table()
    if table:
        print("Table Structure (First 50 rows):")
        for i, row in enumerate(table[:50]):
            print(f"Row {i}: {row}")
    else:
        print("No table found on page 1")
