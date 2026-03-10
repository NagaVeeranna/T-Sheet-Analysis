import pdfplumber
import re
import io
from pypdf import PdfReader, PdfWriter

def clean_pdf(pdf_path):
    """
    Re-saves the PDF using pypdf to fix metadata issues like missing FontBBox,
    which often causes pdfplumber/pdfminer.six to fail.
    """
    try:
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        
        clean_stream = io.BytesIO()
        writer.write(clean_stream)
        clean_stream.seek(0)
        return clean_stream
    except Exception as e:
        print(f"Warning: PDF cleaning failed: {e}")
        return pdf_path # Fallback to original path if cleaning fails

def extract_t_sheet_data(pdf_path):
    all_student_data = []
    current_student = None
    all_subjects = set()
    course_codes = {}
    
    metadata = {
        "branch": "N/A",
        "courseSem": "N/A",
        "heldIn": "N/A"
    }

    # Clean the PDF first to avoid FontBBox errors
    processed_pdf = clean_pdf(pdf_path)
    
    try:
        with pdfplumber.open(processed_pdf) as pdf:
            # Extract metadata from the first page text
            try:
                first_page_text = pdf.pages[0].extract_text()
                if first_page_text:
                    branch_match = re.search(r'Branch:\s*(.*)', first_page_text)
                    course_sem_match = re.search(r'Course/Sem:\s*(.*?)\s*Held in:', first_page_text)
                    held_in_match = re.search(r'Held in:\s*(.*)', first_page_text)
                    
                    if branch_match: metadata["branch"] = branch_match.group(1).strip()
                    if course_sem_match: metadata["courseSem"] = course_sem_match.group(1).strip()
                    if held_in_match: metadata["heldIn"] = held_in_match.group(1).strip()
            except Exception as e:
                print(f"Metadata extraction warning: {e}")

            for page in pdf.pages:
                try:
                    table = page.extract_table()
                    if not table:
                        continue
                    
                    # Find the header row to determine column indices
                    header_row = table[0]
                    if not any('REGD. NO' in str(h).upper() for h in header_row if h):
                        continue
                    
                    # Normalize header for matching
                    header_row_norm = [str(h).upper().replace('\n', ' ').strip() if h else '' for h in header_row]
                    
                    try:
                        regd_idx = header_row_norm.index('REGD. NO')
                        course_name_idx = header_row_norm.index('COURSE NAME')
                        grade_idx = header_row_norm.index('GRADE')
                        sgpa_idx = header_row_norm.index('SGPA')
                        cgpa_idx = header_row_norm.index('CGPA')
                    except ValueError:
                        # If standard columns are missing, skip this table
                        continue

                    # Find Course Code column
                    course_code_idx = None
                    for idx, h in enumerate(header_row_norm):
                        if 'COURSE CODE' in h:
                            course_code_idx = idx
                            break

                    for row in table[1:]:
                        if not row or len(row) <= max(regd_idx, course_name_idx, grade_idx):
                            continue

                        # Check for a new student ID
                        regd_no = str(row[regd_idx]).strip() if row[regd_idx] else None
                        if regd_no and re.match(r'^[0-9A-Z]{10}$', regd_no):
                            # Save the previous student if exists
                            if current_student:
                                all_student_data.append(current_student)
                            
                            current_student = {
                                "regdNo": regd_no,
                                "grades": {},
                                "sgpa": str(row[sgpa_idx]).strip() if row[sgpa_idx] else "",
                                "cgpa": str(row[cgpa_idx]).strip() if row[cgpa_idx] else ""
                            }
                        
                        # If we have a current student, add the subject and grade
                        if current_student and row[course_name_idx] and row[grade_idx]:
                            subject = str(row[course_name_idx]).replace('\n', ' ').strip()
                            grade = str(row[grade_idx]).strip()
                            current_student["grades"][subject] = grade
                            all_subjects.add(subject)
                            
                            # Extract course code if available
                            if course_code_idx is not None and row[course_code_idx]:
                                code = str(row[course_code_idx]).replace('\n', ' ').strip()
                                if code and subject not in course_codes:
                                    course_codes[subject] = code
                            
                            # Update SGPA/CGPA if they appear in later rows
                            if row[sgpa_idx]: current_student["sgpa"] = str(row[sgpa_idx]).strip()
                            if row[cgpa_idx]: current_student["cgpa"] = str(row[cgpa_idx]).strip()
                    
                    # Add only if not already added by subsequent pages
                    if current_student:
                        all_student_data.append(current_student)
                        current_student = None
                except Exception as e:
                    print(f"Page extraction warning: {e}")
                    continue

    except Exception as e:
        print(f"Extraction error: {e}")
        # Return empty data instead of crashing if the whole PDF is unreadable
        return {
            "results": [],
            "subjects": [],
            "metadata": metadata,
            "courseCodes": {}
        }

    # Dedup and Merge logic
    final_data = []
    seen_ids = set()
    for s in all_student_data:
        if s["regdNo"] not in seen_ids:
            final_data.append(s)
            seen_ids.add(s["regdNo"])
        else:
            existing = next((item for item in final_data if item["regdNo"] == s["regdNo"]), None)
            if existing:
                existing["grades"].update(s["grades"])
                if s["sgpa"]: existing["sgpa"] = s["sgpa"]
                if s["cgpa"]: existing["cgpa"] = s["cgpa"]

    return {
        "results": final_data,
        "subjects": sorted(list(all_subjects)),
        "metadata": metadata,
        "courseCodes": course_codes
    }

if __name__ == "__main__":
    data = extract_t_sheet_data(r"d:\T-SHEET\III SEM T SHEET.pdf")
    print(f"Extracted {len(data['results'])} students and {len(data['subjects'])} subjects.")
    if data['results']:
        print("Sample Record:", data['results'][0])
