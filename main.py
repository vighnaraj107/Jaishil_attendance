

import os
import json
import shutil

import re
from datetime import datetime
from modules.pdf_to_image import convert_pdf_to_images
from modules.image_cleaner import clean_image
from modules.claude_extractor import extract_attendance_from_image
from modules.excel_generator import generate_excel
from modules.attendance_processor import (
    process_attendance
)

# FOLDERS
temp_folder = "temp_images"
cleaned_folder = "temp_images/cleaned"
output_folder = "ocr_output"

os.makedirs(output_folder, exist_ok=True)
os.makedirs("processed_pdfs", exist_ok=True)
os.makedirs("output_excels", exist_ok=True)   # FIX: was missing, caused crash on save


def normalize_row_date(extracted_date, pdf_date, filename_date_parsed=False):
    if filename_date_parsed and pdf_date:
        return pdf_date
    if not pdf_date:
        return extracted_date
    pdf_parts = pdf_date.split("-")
    if len(pdf_parts) != 3:
        return pdf_date
    pdf_year, pdf_month, pdf_day = pdf_parts
    day_val = pdf_day
    
    if extracted_date:
        date_str = str(extracted_date).strip()
        parts = re.split(r'[-/ ]', date_str)
        day_str = None
        if len(parts) == 3:
            if len(parts[0]) == 4:
                day_str = parts[2]
            else:
                day_str = parts[0]
        elif len(parts) == 1 and parts[0].isdigit():
            day_str = parts[0]
        if day_str and day_str.isdigit():
            val = int(day_str)
            if 1 <= val <= 31:
                day_val = f"{val:02d}"
                
    return f"{pdf_year}-{pdf_month}-{day_val}"



# INPUT PDF FOLDER
input_folder = "input_pdfs"

all_results = []

pdf_files = [
    f for f in os.listdir(input_folder)
    if f.lower().endswith(".pdf")
]

for pdf_file in pdf_files:

    pdf_path = os.path.join(
        input_folder,
        pdf_file
    )

    print(f"\nProcessing PDF: {pdf_file}\n")

    # ==========================================
    # DATE FROM PDF NAME
    # ==========================================

    pdf_date = None
    filename_date_parsed = False

    match = re.search(
        r"([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})",
        pdf_file
    )

    if match:

        month_name = match.group(1)
        day = int(match.group(2))
        year = int(match.group(3))

        month_number = datetime.strptime(
            month_name,
            "%B"
        ).month

        pdf_date = (
            f"{year}-{month_number:02d}-{day:02d}"
        )

        month_key = (
            f"{year}_{month_number:02d}")

        print(
            f"Attendance Date Found: {pdf_date}"
        )
        filename_date_parsed = True

    else:

        print(
            f"Could not detect date from {pdf_file}"
        )

    # STEP 1 - PDF TO IMAGE

    image_paths = convert_pdf_to_images(
        pdf_path,
        temp_folder
    )

    # STEP 2 - CLEAN IMAGES

    cleaned_images = []

    for image_path in image_paths:

        cleaned_image = clean_image(
            image_path,
            cleaned_folder
        )

        cleaned_images.append(
            cleaned_image
        )

    # STEP 3 - EXTRACT ATTENDANCE

    for index, image_path in enumerate(
        cleaned_images,
        start=1
    ):

        print(
            f"\nProcessing Page {index}...\n"
        )

        extracted_data = (
            extract_attendance_from_image(
                image_path
            )
        )

        # ==========================================
        # USE EXTRACTED DATE (FALLBACK/FORCE YEAR & MONTH TO PDF NAME DATE)
        # ==========================================
        for row in extracted_data:
            extracted_date = row.get("date")
            row["date"] = normalize_row_date(extracted_date, pdf_date, filename_date_parsed)

        all_results.extend(
            extracted_data
        )

        print("\nAttendance Extraction Completed\n")

    # ==========================================
    # FIX: these were inside the image loop before.
    # Now they run ONCE after ALL pages of the PDF
    # are processed — so the PDF isn't moved mid-way
    # and the excel is only written once per PDF.
    # ==========================================

    print("\nTOTAL RECORDS:", len(all_results))

    print("\nRAW CONTRACTORS FOUND:")

    raw_contractors = set()

    for row in all_results:

        raw_contractors.add(
            row.get("contractor", "")
        )

    for c in sorted(raw_contractors):
        print(c)

    # 5. Group results by month and generate Excel
    primary_excel_file = f"output_excels/attendance_{month_key}.xlsx"
    if not all_results:
        generate_excel({}, primary_excel_file)
    else:
        from collections import defaultdict
        results_by_month = defaultdict(list)
        for row in all_results:
            row_date = row.get("date")
            if row_date and re.match(r"^\d{4}-\d{2}-\d{2}$", str(row_date)):
                parts = row_date.split("-")
                row_month_key = f"{parts[0]}_{parts[1]}"
            else:
                row_month_key = month_key
            results_by_month[row_month_key].append(row)

        for row_month_key, group_results in results_by_month.items():
            structured_data = process_attendance(group_results)
            print(f"\nCONTRACTORS FOUND FOR MONTH {row_month_key}:\n")
            for contractor in structured_data.keys():
                print(contractor)
            excel_file = f"output_excels/attendance_{row_month_key}.xlsx"
            generate_excel(structured_data, excel_file)

    if os.path.exists(pdf_path):
        dest_path = os.path.join("processed_pdfs", pdf_file)
        if os.path.exists(dest_path):
            try:
                os.remove(dest_path)
            except Exception as e:
                print(f"Warning: Could not remove existing file {dest_path}: {e}")
        shutil.move(pdf_path, dest_path)
        print(f"Moved {pdf_file} to processed_pdfs")
    else:
        print(f"Note: {pdf_file} was already moved or is missing.")
