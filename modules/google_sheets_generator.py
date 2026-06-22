import os
import json
import datetime
import hashlib
# pyrefly: ignore [missing-import]
import gspread
from google.oauth2.service_account import Credentials

CONTRACTOR_MAPPING = {
    "Shri Shyam": {"id": "shyam", "color": "var(--navy)"},
    "Ayush": {"id": "ayush", "color": "var(--teal-brand)"},
    "Shri Laxmi": {"id": "laxmi", "color": "var(--emerald-brand)"},
    "Ansh": {"id": "ansh", "color": "var(--warning)"},
    "Shri Radha": {"id": "radha", "color": "var(--slate-cool)"},
    "Jaishil Sulphur and Chemical Industries": {"id": "jaishil", "color": "var(--navy-deep)"}
}

def get_employee_id(contractor_name, shift, name):
    unique_str = f"{contractor_name}_{shift}_{name}"
    return "e_" + hashlib.md5(unique_str.encode('utf-8')).hexdigest()[:8]

def get_gspread_client():
    creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if creds_json:
        try:
            info = json.loads(creds_json)
            scopes = [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive"
            ]
            credentials = Credentials.from_service_account_info(info, scopes=scopes)
            return gspread.authorize(credentials)
        except Exception as e:
            print(f"Error parsing GOOGLE_CREDENTIALS_JSON env var: {e}")
            
    # Fallback to local credentials file for development
    local_creds = "service_account_credentials.json"
    if os.path.exists(local_creds):
        try:
            return gspread.service_account(filename=local_creds)
        except Exception as e:
            print(f"Error loading credentials from {local_creds}: {e}")
            
    raise ValueError("Google Sheets credentials not found. Please set GOOGLE_CREDENTIALS_JSON or place service_account_credentials.json locally.")

def get_or_create_spreadsheet(month_key):
    client = get_gspread_client()
    title = f"Attendance_{month_key}"
    
    # Try to open spreadsheet
    try:
        spreadsheet = client.open(title)
        print(f"Opened existing Google Spreadsheet: {title}")
        return spreadsheet
    except gspread.SpreadsheetNotFound:
        # Create new spreadsheet
        try:
            spreadsheet = client.create(title)
            print(f"Created new Google Spreadsheet: {title}")
            
            # Share with user if email is set
            user_email = os.getenv("USER_EMAIL")
            if user_email:
                try:
                    spreadsheet.share(user_email, perm_type='user', role='writer')
                    print(f"Shared spreadsheet with {user_email}")
                except Exception as e:
                    print(f"Warning: Failed to share spreadsheet with {user_email}: {e}")
                    
            return spreadsheet
        except gspread.exceptions.APIError as e:
            if "storage quota" in str(e).lower() or "quota" in str(e).lower():
                service_account_email = "your service account email"
                # Extract service account email if possible
                try:
                    if hasattr(client, 'auth') and hasattr(client.auth, 'signer_email'):
                        service_account_email = client.auth.signer_email
                except:
                    pass
                raise RuntimeError(
                    f"Google Drive quota exceeded for the Service Account. "
                    f"Please resolve this by manually creating a new Google Spreadsheet named '{title}' "
                    f"in your own personal Google Drive and sharing it with your service account email: "
                    f"'{service_account_email}' as Editor. The system will then automatically connect and update it."
                ) from e
            raise e

def list_google_spreadsheets():
    client = get_gspread_client()
    try:
        files = client.list_spreadsheet_files()
        results = []
        for f in files:
            name = f.get("name", "")
            if name.startswith("Attendance_"):
                parts = name.split("_")
                if len(parts) >= 3:
                    month_key = f"{parts[1]}_{parts[2]}"
                else:
                    month_key = "current"
                
                modified_time_str = f.get("modifiedTime", "")
                if modified_time_str:
                    try:
                        # Parse ISO format (e.g. 2026-06-16T07:20:34.783Z)
                        dt = datetime.datetime.fromisoformat(modified_time_str.replace("Z", "+00:00"))
                        generated_at = dt.strftime("%b %d, %Y · %H:%M")
                    except:
                        generated_at = datetime.datetime.now().strftime("%b %d, %Y · %H:%M")
                else:
                    generated_at = datetime.datetime.now().strftime("%b %d, %Y · %H:%M")
                    
                results.append({
                    "name": f"attendance_{month_key}.xlsx",
                    "size": "Google Drive",
                    "generatedAt": generated_at,
                    "records": 0  # Can be populated if needed
                })
        results.sort(key=lambda x: x["name"], reverse=True)
        return results
    except Exception as e:
        print(f"Error listing spreadsheets: {e}")
        return []

def format_time_value(val):
    if val is None:
        return ""
    val_str = str(val).strip()
    if val_str.upper() in ["NONE", ""]:
        return ""
    return val_str

def parse_google_worksheet_data(rows):
    """
    Parses a 2D grid from Google Sheets into the structured attendance dictionary.
    """
    shift_data = {
        "DAY": {},
        "NIGHT": {}
    }
    if not rows or len(rows) < 5:
        return shift_data
        
    current_shift = "DAY"
    row_idx = 4  # row 5 in 0-indexed terms
    max_row_idx = len(rows) - 1
    
    while row_idx <= max_row_idx:
        val_1 = rows[row_idx][0] if len(rows[row_idx]) > 0 else ""
        val_2 = rows[row_idx][1] if len(rows[row_idx]) > 1 else ""
        
        # Check if shift header
        if val_1 and "SHIFT" in str(val_1).upper():
            if "DAY" in str(val_1).upper():
                current_shift = "DAY"
            elif "NIGHT" in str(val_1).upper():
                current_shift = "NIGHT"
            row_idx += 1
            continue
        
        # Check if employee row
        if val_1 and val_2 == "IN":
            employee_name = val_1.strip()
            employee_data = {}
            
            # Check if there is a TOTAL row
            has_total_row = False
            if row_idx + 2 <= max_row_idx and len(rows[row_idx + 2]) > 1:
                has_total_row = (rows[row_idx + 2][1] == "TOTAL")
                
            ot_offset = 3 if has_total_row else 2
            total_offset = 2 if has_total_row else None
            
            for day in range(1, 32):
                col_idx = day + 1  # column C is index 2 (day 1)
                
                in_time = ""
                out_time = ""
                ot_time = ""
                total_time = ""
                
                if row_idx < len(rows) and col_idx < len(rows[row_idx]):
                    in_time = rows[row_idx][col_idx]
                if row_idx + 1 < len(rows) and col_idx < len(rows[row_idx + 1]):
                    out_time = rows[row_idx + 1][col_idx]
                if row_idx + ot_offset < len(rows) and col_idx < len(rows[row_idx + ot_offset]):
                    ot_time = rows[row_idx + ot_offset][col_idx]
                if total_offset is not None and row_idx + total_offset < len(rows) and col_idx < len(rows[row_idx + total_offset]):
                    total_time = rows[row_idx + total_offset][col_idx]
                    
                if in_time or out_time or ot_time or total_time:
                    formatted_in = format_time_value(in_time)
                    formatted_out = format_time_value(out_time)
                    formatted_ot = format_time_value(ot_time)
                    
                    if has_total_row:
                        formatted_total = format_time_value(total_time)
                    else:
                        from modules.calculations import calculate_work_hours
                        formatted_total = calculate_work_hours(formatted_in, formatted_out) if (formatted_in and formatted_out) else ""
                    
                    employee_data[day] = {
                        "in": formatted_in,
                        "out": formatted_out,
                        "work_hours": formatted_total,
                        "ot": formatted_ot
                    }
                    
            shift_data[current_shift][employee_name] = employee_data
            row_idx += 5 if has_total_row else 4
            continue
            
        row_idx += 1
        
    return shift_data

def load_attendance_from_google_sheets(month_key):
    """
    Fetches all data from the Google Sheet and converts it into the React JSON schema.
    """
    try:
        spreadsheet = get_or_create_spreadsheet(month_key)
    except Exception as e:
        print(f"Error opening spreadsheet for month {month_key}: {e}")
        return {
            "month": month_key,
            "contractors": [],
            "employees": [],
            "attendance": {}
        }
        
    contractors_list = []
    employees_list = []
    attendance_map = {}
    
    # Initialize contractors list
    for c_name, c_info in CONTRACTOR_MAPPING.items():
        contractors_list.append({
            "id": c_info["id"],
            "name": c_name,
            "employees": 0,
            "color": c_info["color"]
        })
        
    needs_save = False
    recalculated_structured_data = {}
    
    try:
        worksheets = spreadsheet.worksheets()
        for ws in worksheets:
            sheet_name = ws.title
            
            # Resolve contractor name
            contractor_name = sheet_name
            matched_c_name = None
            for c_name in CONTRACTOR_MAPPING.keys():
                if c_name.startswith(sheet_name) or sheet_name.startswith(c_name[:30]):
                    matched_c_name = c_name
                    break
            if not matched_c_name:
                matched_c_name = contractor_name
                
            c_info = CONTRACTOR_MAPPING.get(matched_c_name)
            c_id = c_info["id"] if c_info else contractor_name.lower().replace(" ", "_")
            
            rows = ws.get_all_values()
            parsed_sheet = parse_google_worksheet_data(rows)
            
            cnt = sum(len(parsed_sheet.get(s, {})) for s in ["DAY", "NIGHT"])
            found_c = False
            for c in contractors_list:
                if c["id"] == c_id:
                    c["employees"] = cnt
                    found_c = True
                    break
            if not found_c:
                contractors_list.append({
                    "id": c_id,
                    "name": matched_c_name,
                    "employees": cnt,
                    "color": "var(--slate-cool)"
                })
                
            recalculated_structured_data[matched_c_name] = {"DAY": {}, "NIGHT": {}}
            
            for shift_name in ["DAY", "NIGHT"]:
                emps = parsed_sheet.get(shift_name, {})
                for emp_name, att_data in emps.items():
                    emp_id = get_employee_id(matched_c_name, shift_name, emp_name)
                    employees_list.append({
                        "id": emp_id,
                        "name": emp_name,
                        "contractorId": c_id,
                        "shift": shift_name
                    })
                    
                    attendance_map[emp_id] = {}
                    employee_day_data = {}
                    for day_num, day_vals in att_data.items():
                        in_val = day_vals.get("in", "")
                        out_val = day_vals.get("out", "")
                        work_hours_val = day_vals.get("work_hours", "")
                        ot_val = day_vals.get("ot", "")
                        
                        from modules.calculations import calculate_work_hours, calculate_overtime
                        if in_val and out_val:
                            calc_work_hours = calculate_work_hours(in_val, out_val)
                            calc_ot = calculate_overtime(calc_work_hours)
                        else:
                            calc_work_hours = ""
                            calc_ot = ""
                            
                        if calc_work_hours != work_hours_val or calc_ot != ot_val:
                            needs_save = True
                            
                        day_entry = {
                            "in": in_val,
                            "out": out_val,
                            "work_hours": calc_work_hours,
                            "ot": calc_ot
                        }
                        attendance_map[emp_id][day_num] = day_entry
                        employee_day_data[day_num] = day_entry
                        
                    recalculated_structured_data[matched_c_name][shift_name][emp_name] = employee_day_data
                    
        if needs_save:
            print("Mismatch/changes detected in Google Sheet timings. Recalculating and saving back to Google Sheets...")
            save_to_google_sheets(recalculated_structured_data, month_key)
            
    except Exception as e:
        print(f"Error parsing google worksheets: {e}")
        
    return {
        "month": month_key,
        "contractors": contractors_list,
        "employees": employees_list,
        "attendance": attendance_map
    }

def save_to_google_sheets(structured_data, month_key):
    """
    Saves the structured attendance data into sheets and styles them like the Excel reports.
    """
    # 1. Load existing data from Google Sheets to merge
    existing_data = {}
    try:
        spreadsheet = get_or_create_spreadsheet(month_key)
        worksheets = {ws.title: ws for ws in spreadsheet.worksheets()}
        for title, ws in worksheets.items():
            contractor_name = title
            for c_name in CONTRACTOR_MAPPING.keys():
                if c_name.startswith(title) or title.startswith(c_name[:30]):
                    contractor_name = c_name
                    break
            rows = ws.get_all_values()
            existing_data[contractor_name] = parse_google_worksheet_data(rows)
    except Exception as e:
        print(f"Error loading existing data for merge: {e}")
        existing_data = {}
        
    # 2. Merge existing data with new data
    from modules.excel_generator import merge_attendance_data
    merged_data = merge_attendance_data(existing_data, structured_data)
    
    # 3. Create/update worksheets
    client = get_gspread_client()
    spreadsheet = get_or_create_spreadsheet(month_key)
    worksheets = {ws.title: ws for ws in spreadsheet.worksheets()}
    
    for contractor, shifts in merged_data.items():
        # Google Sheet allows up to 100 character worksheet titles
        sheet_title = contractor[:99]
        
        if sheet_title in worksheets:
            ws = worksheets[sheet_title]
            ws.clear()
        else:
            ws = spreadsheet.add_worksheet(title=sheet_title, rows="100", cols="40")
            
        grid_values = []
        grid_values.append([f"{contractor} ATTENDANCE"])  # Title
        grid_values.append([])  # Spacer
        
        # Headers
        headers = ["Employee Name", "Type"]
        for day in range(1, 32):
            headers.append(day)
        headers.extend(["Total Days", "Total OT", "OT Days"])
        grid_values.append(headers)
        grid_values.append([])  # Spacer
        
        merge_ranges = []
        # Title merge range: A1:AJ1 (0-indexed row 0, cols 0 to 35)
        merge_ranges.append({
            "startRowIndex": 0, "endRowIndex": 1,
            "startColumnIndex": 0, "endColumnIndex": 36
        })
        
        for shift_name in ["DAY", "NIGHT"]:
            grid_values.append([f"{shift_name} SHIFT"])
            shift_row_idx = len(grid_values) - 1
            merge_ranges.append({
                "startRowIndex": shift_row_idx, "endRowIndex": shift_row_idx + 1,
                "startColumnIndex": 0, "endColumnIndex": 36
            })
            
            employees = shifts.get(shift_name, {})
            for employee, attendance in employees.items():
                start_row_idx = len(grid_values)
                
                row_in = [employee, "IN"]
                row_out = ["", "OUT"]
                row_total = ["", "TOTAL"]
                row_ot = ["", "OT"]
                
                # Merge employee name column (col 0, rows start_row_idx to start_row_idx+4)
                merge_ranges.append({
                    "startRowIndex": start_row_idx, "endRowIndex": start_row_idx + 4,
                    "startColumnIndex": 0, "endColumnIndex": 1
                })
                
                total_days = 0
                total_ot_minutes = 0
                
                for day in range(1, 32):
                    in_val = ""
                    out_val = ""
                    total_val = ""
                    ot_val = ""
                    
                    if day in attendance:
                        data = attendance[day]
                        in_val = data.get("in", "")
                        out_val = data.get("out", "")
                        total_val = data.get("work_hours", "")
                        ot_val = data.get("ot", "")
                        
                        if in_val and out_val and not total_val:
                            from modules.calculations import calculate_work_hours
                            total_val = calculate_work_hours(in_val, out_val)
                            
                        if in_val:
                            total_days += 1
                        if ot_val:
                            try:
                                h, m = map(int, str(ot_val).split(":"))
                                total_ot_minutes += h * 60 + m
                            except:
                                pass
                                
                    row_in.append(in_val)
                    row_out.append(out_val)
                    row_total.append(total_val)
                    row_ot.append(ot_val)
                    
                ot_hours = total_ot_minutes // 60
                ot_mins = total_ot_minutes % 60
                total_ot = f"{ot_hours:02}:{ot_mins:02}"
                ot_days = round(total_ot_minutes / 480, 2)
                
                row_in.append(total_days)
                row_out.append("")
                row_total.append(total_ot)
                row_ot.append(ot_days)
                
                # Merge summary columns (cols 34, 35, 36) across the 4 rows
                merge_ranges.append({
                    "startRowIndex": start_row_idx, "endRowIndex": start_row_idx + 4,
                    "startColumnIndex": 34, "endColumnIndex": 35
                })
                merge_ranges.append({
                    "startRowIndex": start_row_idx, "endRowIndex": start_row_idx + 4,
                    "startColumnIndex": 35, "endColumnIndex": 36
                })
                merge_ranges.append({
                    "startRowIndex": start_row_idx, "endRowIndex": start_row_idx + 4,
                    "startColumnIndex": 36, "endColumnIndex": 37
                })
                
                grid_values.append(row_in)
                grid_values.append(row_out)
                grid_values.append(row_total)
                grid_values.append(row_ot)
                grid_values.append([])  # Spacer row
                
        # Format the grid
        formatted_grid = []
        for r in grid_values:
            formatted_row = [str(x) if x is not None else "" for x in r]
            formatted_grid.append(formatted_row)
            
        max_len = max(len(row) for row in formatted_grid) if formatted_grid else 0
        for i in range(len(formatted_grid)):
            while len(formatted_grid[i]) < max_len:
                formatted_grid[i].append("")
                
        ws.update(formatted_grid, 'A1')
        
        # Apply style formatting
        try:
            ws_id = ws.id
            requests = []
            
            # Clear existing merges
            requests.append({
                "unmergeCells": {
                    "range": {
                        "sheetId": ws_id,
                        "startRowIndex": 0,
                        "endRowIndex": 100,
                        "startColumnIndex": 0,
                        "endColumnIndex": 40
                    }
                }
            })
            
            # Merges
            for m in merge_ranges:
                m_copy = m.copy()
                m_copy["sheetId"] = ws_id
                requests.append({
                    "mergeCells": {
                        "range": m_copy,
                        "mergeType": "MERGE_ALL"
                    }
                })
                
            # Column widths
            requests.append({
                "updateDimensionProperties": {
                    "range": {"sheetId": ws_id, "dimension": "COLUMNS", "startIndex": 0, "endIndex": 1},
                    "properties": {"pixelSize": 200}, "fields": "pixelSize"
                }
            })
            requests.append({
                "updateDimensionProperties": {
                    "range": {"sheetId": ws_id, "dimension": "COLUMNS", "startIndex": 1, "endIndex": 2},
                    "properties": {"pixelSize": 80}, "fields": "pixelSize"
                }
            })
            requests.append({
                "updateDimensionProperties": {
                    "range": {"sheetId": ws_id, "dimension": "COLUMNS", "startIndex": 2, "endIndex": 37},
                    "properties": {"pixelSize": 60}, "fields": "pixelSize"
                }
            })
            
            # Default center alignment and font settings
            requests.append({
                "repeatCell": {
                    "range": {
                        "sheetId": ws_id,
                        "startRowIndex": 0,
                        "endRowIndex": len(formatted_grid),
                        "startColumnIndex": 0,
                        "endColumnIndex": max_len
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "horizontalAlignment": "CENTER",
                            "verticalAlignment": "MIDDLE",
                            "textFormat": {"fontSize": 10, "fontFamily": "Roboto"}
                        }
                    },
                    "fields": "userEnteredFormat.horizontalAlignment,userEnteredFormat.verticalAlignment,userEnteredFormat.textFormat"
                }
            })
            
            # Title header styling (Navy Blue background, White bold text)
            requests.append({
                "repeatCell": {
                    "range": {"sheetId": ws_id, "startRowIndex": 0, "endRowIndex": 1, "startColumnIndex": 0, "endColumnIndex": 36},
                    "cell": {
                        "userEnteredFormat": {
                            "backgroundColor": {"red": 0.12, "green": 0.31, "blue": 0.47},
                            "textFormat": {"foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0}, "bold": True, "fontSize": 14}
                        }
                    },
                    "fields": "userEnteredFormat.backgroundColor,userEnteredFormat.textFormat"
                }
            })
            
            # Column headers styling
            requests.append({
                "repeatCell": {
                    "range": {"sheetId": ws_id, "startRowIndex": 2, "endRowIndex": 3, "startColumnIndex": 0, "endColumnIndex": 37},
                    "cell": {
                        "userEnteredFormat": {
                            "backgroundColor": {"red": 0.09, "green": 0.21, "blue": 0.36},
                            "textFormat": {"foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0}, "bold": True, "fontSize": 10}
                        }
                    },
                    "fields": "userEnteredFormat.backgroundColor,userEnteredFormat.textFormat"
                }
            })
            
            # Shift section styling
            for row_idx, row_vals in enumerate(grid_values):
                if len(row_vals) > 0 and "SHIFT" in str(row_vals[0]):
                    requests.append({
                        "repeatCell": {
                            "range": {"sheetId": ws_id, "startRowIndex": row_idx, "endRowIndex": row_idx + 1, "startColumnIndex": 0, "endColumnIndex": 36},
                            "cell": {
                                "userEnteredFormat": {
                                    "backgroundColor": {"red": 0.09, "green": 0.21, "blue": 0.36},
                                    "textFormat": {"foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0}, "bold": True}
                                }
                            },
                            "fields": "userEnteredFormat.backgroundColor,userEnteredFormat.textFormat"
                        }
                    })
                    
            spreadsheet.batch_update({"requests": requests})
        except Exception as e:
            print(f"Warning: Failed to format worksheet {sheet_title}: {e}")
            
    # Delete the default sheet 'Sheet1' if it exists and we have other sheets
    try:
        default_sheet = spreadsheet.worksheet("Sheet1")
        if len(spreadsheet.worksheets()) > 1:
            spreadsheet.del_worksheet(default_sheet)
    except gspread.WorksheetNotFound:
        pass
