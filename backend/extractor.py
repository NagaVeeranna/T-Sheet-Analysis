import pdfplumber
import re

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
    
    with pdfplumber.open(pdf_path) as pdf:
        # Extract metadata from the first page text
        first_page_text = pdf.pages[0].extract_text()
        if first_page_text:
            branch_match = re.search(r'Branch:\s*(.*)', first_page_text)
            course_sem_match = re.search(r'Course/Sem:\s*(.*?)\s*Held in:', first_page_text)
            held_in_match = re.search(r'Held in:\s*(.*)', first_page_text)
            
            if branch_match: metadata["branch"] = branch_match.group(1).strip()
            if course_sem_match: metadata["courseSem"] = course_sem_match.group(1).strip()
            if held_in_match: metadata["heldIn"] = held_in_match.group(1).strip()

        for page in pdf.pages:
            table = page.extract_table()
            if not table:
                continue
            
            # Find the header row to determine column indices
            header_row = table[0]
            if 'REGD. NO' not in header_row:
                continue
            
            regd_idx = header_row.index('REGD. NO')
            course_name_idx = header_row.index('Course Name')
            grade_idx = header_row.index('Grade')
            sgpa_idx = header_row.index('SGPA')
            cgpa_idx = header_row.index('CGPA')
            # Find Course Code column (header may contain newline)
            course_code_idx = None
            for idx, h in enumerate(header_row):
                if h and 'Course Code' in h.replace('\n', ' '):
                    course_code_idx = idx
                    break

            for row in table[1:]:
                # Check for a new student ID
                regd_no = row[regd_idx]
                if regd_no and re.match(r'^[0-9A-Z]{10}$', regd_no):
                    # Save the previous student if exists
                    if current_student:
                        all_student_data.append(current_student)
                    
                    current_student = {
                        "regdNo": regd_no,
                        "grades": {},
                        "sgpa": row[sgpa_idx],
                        "cgpa": row[cgpa_idx]
                    }
                
                # If we have a current student, add the subject and grade
                if current_student and row[course_name_idx] and row[grade_idx]:
                    subject = row[course_name_idx].replace('\n', ' ').strip()
                    grade = row[grade_idx].strip()
                    current_student["grades"][subject] = grade
                    all_subjects.add(subject)
                    # Extract course code if available
                    if course_code_idx is not None and row[course_code_idx]:
                        code = row[course_code_idx].replace('\n', ' ').strip()
                        if code and subject not in course_codes:
                            course_codes[subject] = code
                    
                    # Update SGPA/CGPA if they appear in later rows for the same student
                    if row[sgpa_idx]: current_student["sgpa"] = row[sgpa_idx]
                    if row[cgpa_idx]: current_student["cgpa"] = row[cgpa_idx]
            
            # Add the last student from the page if any
            if current_student:
                all_student_data.append(current_student)
                current_student = None

    # Dedup students (since some might be added multiple times if they span pages)
    final_data = []
    seen_ids = set()
    for s in all_student_data:
        if s["regdNo"] not in seen_ids:
            final_data.append(s)
            seen_ids.add(s["regdNo"])
        else:
            # Merge grades if student already exists (page break)
            existing = next(item for item in final_data if item["regdNo"] == s["regdNo"])
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
