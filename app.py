import os
import re
import shutil
import hashlib
import datetime
import traceback
import uuid
from flask import Flask, request, jsonify, send_from_directory, send_file, after_this_request
from flask_cors import CORS
from modules.google_sheets_generator import save_to_google_sheets
from dotenv import load_dotenv

from modules.pdf_to_image import convert_pdf_to_images
from modules.image_cleaner import clean_image
from modules.claude_extractor import extract_attendance_from_image
from modules.excel_generator import generate_excel, parse_existing_sheet
from modules.attendance_processor import process_attendance

load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes (necessary for Vercel -> Render communication)
CORS(app)


@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "jaishil-attendance"}), 200

# Ensure folders exist
os.makedirs("input_pdfs", exist_ok=True)
os.makedirs("processed_pdfs", exist_ok=True)
os.makedirs("output_excels", exist_ok=True)
os.makedirs("temp_images", exist_ok=True)

CONTRACTOR_MAPPING = {
    "Shri Shyam": {"id": "shyam", "color": "var(--navy)"},
    "Ayush": {"id": "ayush", "color": "var(--teal-brand)"},
    "Shri Laxmi": {"id": "laxmi", "color": "var(--emerald-brand)"},
    "Ansh": {"id": "ansh", "color": "var(--warning)"},
    "Shri Radha": {"id": "radha", "color": "var(--slate-cool)"},
    "Jaishil Sulphur and Chemical Industries": {"id": "jaishil", "color": "var(--navy-deep)"}
}

REV_CONTRACTOR_MAPPING = {v["id"]: k for k, v in CONTRACTOR_MAPPING.items()}


def get_employee_id(contractor_name, shift, name):
    unique_str = f"{contractor_name}_{shift}_{name}"
    return "e_" + hashlib.md5(unique_str.encode('utf-8')).hexdigest()[:8]


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



def run_pipeline_on_pdf(pdf_path, pdf_file):
    temp_folder = "temp_images"
    cleaned_folder = "temp_images/cleaned"
    
    # 1. Parse date from filename
    pdf_date = None
    filename_date_parsed = False
    match = re.search(r"([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})", pdf_file)
    if match:
        month_name = match.group(1)
        day = int(match.group(2))
        year = int(match.group(3))
        month_number = datetime.datetime.strptime(month_name, "%B").month
        pdf_date = f"{year}-{month_number:02d}-{day:02d}"
        month_key = f"{year}_{month_number:02d}"
        filename_date_parsed = True
    else:
        # fallback to current date
        now = datetime.datetime.now()
        pdf_date = now.strftime("%Y-%m-%d")
        month_key = now.strftime("%Y_%m")
        
    # 2. PDF to images
    image_paths = convert_pdf_to_images(pdf_path, temp_folder)
    
    # 3. Clean images
    cleaned_images = []
    for image_path in image_paths:
        cleaned_image = clean_image(image_path, cleaned_folder)
        cleaned_images.append(cleaned_image)
        
    # 4. Extract attendance from each page
    all_results = []
    for index, image_path in enumerate(cleaned_images, start=1):
        extracted_data = extract_attendance_from_image(image_path)
        
        # Use extracted date (fallback/force year & month to pdf_date)
        for row in extracted_data:
            extracted_date = row.get("date")
            row["date"] = normalize_row_date(extracted_date, pdf_date, filename_date_parsed)
                
        all_results.extend(extracted_data)
        
    # 5. Group results by month
    primary_excel_file = f"attendance_{month_key}.xlsx"
    if not all_results:
        save_to_google_sheets({}, month_key)
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
            save_to_google_sheets(structured_data, row_month_key)
            
    # 6. Move PDF safely
    if os.path.exists(pdf_path):
        dest_path = os.path.join("processed_pdfs", pdf_file)
        if os.path.exists(dest_path):
            try:
                os.remove(dest_path)
            except Exception as e:
                print(f"Warning: Could not remove existing file {dest_path}: {e}")
        shutil.move(pdf_path, dest_path)
        
    return len(all_results), primary_excel_file


@app.route("/api/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are allowed"}), 400
        
    pdf_path = os.path.join("input_pdfs", file.filename)
    file.save(pdf_path)
    
    try:
        records_count, excel_file = run_pipeline_on_pdf(pdf_path, file.filename)
        return jsonify({
            "ok": True,
            "filename": file.filename,
            "records": records_count,
            "excel": os.path.basename(excel_file)
        })
    except Exception as e:
        # Clean up input file if pipeline fails
        traceback.print_exc()
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        error_msg = str(e)
        if "Permission denied" in error_msg or "[Errno 13]" in error_msg:
            return jsonify({"error": "Permission Denied: The Excel ledger file is currently open in Microsoft Excel. Please close the Excel window and try uploading again."}), 500
        return jsonify({"error": error_msg}), 500


@app.route("/api/attendance", methods=["GET"])
def get_attendance():
    month_key = request.args.get("month")  # format: YYYY_MM (e.g. 2026_05)
    if not month_key:
        # Fallback to current month if not provided
        now = datetime.datetime.now()
        month_key = now.strftime("%Y_%m")
        
    from modules.google_sheets_generator import load_attendance_from_google_sheets
    try:
        data = load_attendance_from_google_sheets(month_key)
        return jsonify(data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Error loading data from Google Sheets: {str(e)}"}), 500


@app.route("/api/attendance/save", methods=["POST", "PUT"])
def save_attendance():
    payload = request.json
    if not payload:
        return jsonify({"error": "Missing payload"}), 400
        
    month_key = payload.get("month")
    if not month_key:
        return jsonify({"error": "Missing month in payload"}), 400
        
    attendance_data = payload.get("attendance", {})
    employees_list = payload.get("employees", [])
    contractors_list = payload.get("contractors", [])
    
    # Reconstruct structured_data
    structured_data = {}
    
    for emp in employees_list:
        emp_id = emp["id"]
        emp_name = emp["name"]
        shift = emp["shift"]
        c_id = emp["contractorId"]
        
        contractor_name = "UNKNOWN"
        for c in contractors_list:
            if c["id"] == c_id:
                contractor_name = c["name"]
                break
        if contractor_name == "UNKNOWN":
            contractor_name = REV_CONTRACTOR_MAPPING.get(c_id, c_id)
            
        if contractor_name not in structured_data:
            structured_data[contractor_name] = {"DAY": {}, "NIGHT": {}}
            
        emp_att = attendance_data.get(emp_id, {})
        
        daily_data = {}
        for day_str, vals in emp_att.items():
            try:
                day_num = int(day_str)
                if vals.get("in") or vals.get("out") or vals.get("ot") or vals.get("work_hours"):
                    daily_data[day_num] = {
                        "in": vals.get("in", ""),
                        "out": vals.get("out", ""),
                        "work_hours": vals.get("work_hours", ""),
                        "ot": vals.get("ot", "")
                    }
            except ValueError:
                continue
                
        if daily_data:
            structured_data[contractor_name][shift][emp_name] = daily_data
            
    try:
        save_to_google_sheets(structured_data, month_key)
        return jsonify({"ok": True})
    except Exception as e:
        error_msg = str(e)
        return jsonify({"error": f"Failed to save to Google Sheets: {error_msg}"}), 500


@app.route("/api/files", methods=["GET"])
def get_files():
    from modules.google_sheets_generator import list_google_spreadsheets
    try:
        files = list_google_spreadsheets()
        return jsonify(files)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to list Google Sheets: {str(e)}"}), 500


@app.route("/api/download/<filename>", methods=["GET"])
def download_file(filename):
    # Parse month_key from filename, e.g. "attendance_2026_05.xlsx"
    match = re.search(r"attendance_(\d{4}_\d{2})\.xlsx", filename)
    if not match:
        return jsonify({"error": "Invalid filename format"}), 400
    month_key = match.group(1)
    
    from modules.google_sheets_generator import load_attendance_from_google_sheets
    res = load_attendance_from_google_sheets(month_key)
    
    # Reconstruct structured_data from res
    structured_data = {}
    attendance_data = res.get("attendance", {})
    employees_list = res.get("employees", [])
    contractors_list = res.get("contractors", [])
    
    for emp in employees_list:
        emp_id = emp["id"]
        emp_name = emp["name"]
        shift = emp["shift"]
        c_id = emp["contractorId"]
        
        contractor_name = "UNKNOWN"
        for c in contractors_list:
            if c["id"] == c_id:
                contractor_name = c["name"]
                break
        if contractor_name == "UNKNOWN":
            contractor_name = REV_CONTRACTOR_MAPPING.get(c_id, c_id)
            
        if contractor_name not in structured_data:
            structured_data[contractor_name] = {"DAY": {}, "NIGHT": {}}
            
        emp_att = attendance_data.get(emp_id, {})
        
        daily_data = {}
        for day_str, vals in emp_att.items():
            try:
                day_num = int(day_str)
                if vals.get("in") or vals.get("out") or vals.get("ot") or vals.get("work_hours"):
                    daily_data[day_num] = {
                        "in": vals.get("in", ""),
                        "out": vals.get("out", ""),
                        "work_hours": vals.get("work_hours", ""),
                        "ot": vals.get("ot", "")
                    }
            except ValueError:
                continue
                
        if daily_data:
            structured_data[contractor_name][shift][emp_name] = daily_data
            
    # Generate unique temp export path
    temp_id = str(uuid.uuid4())
    temp_filename = f"temp_export_{temp_id}.xlsx"
    os.makedirs("temp_exports", exist_ok=True)
    temp_filepath = os.path.join("temp_exports", temp_filename)
    
    @after_this_request
    def remove_file(response):
        try:
            if os.path.exists(temp_filepath):
                os.remove(temp_filepath)
        except Exception as e:
            print(f"Error removing temp file {temp_filepath}: {e}")
        return response
        
    try:
        generate_excel(structured_data, temp_filepath)
        return send_file(
            os.path.abspath(temp_filepath),
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to generate download: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
