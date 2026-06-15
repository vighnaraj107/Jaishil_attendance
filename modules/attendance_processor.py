from collections import defaultdict
from datetime import datetime, timedelta
from difflib import get_close_matches
from modules.employee_matcher import correct_employee_name, load_master_list


VALID_CONTRACTORS = [
    "Shri Shyam",
    "Ayush",
    "Shri Laxmi",
    "Ansh",
    "Shri Radha",
    "Jaishil Sulphur and Chemical Industries"
]

# Manual overrides — catch common OCR mistakes before fuzzy matching
MANUAL_FIXES = {
    "Shiv/Radha":   "Shri Radha",
    "Shiv Radha":   "Shri Radha",
    "Sri Radha":    "Shri Radha",
    "Radha":        "Shri Radha",
    "Shri Rada":    "Shri Radha",

    "Ansh Group":   "Ansh",
    "Anish":        "Ansh",
    "Ansh Grp":     "Ansh",

    "Ayush T":      "Ayush",
    "Aayush":       "Ayush",

    "Shri Shyam G": "Shri Shyam",

    "Jaishil Sulphur & Chemical Industries": "Jaishil Sulphur and Chemical Industries",
    "Jaishil Sulphur":                       "Jaishil Sulphur and Chemical Industries",
    "Jaishil":                               "Jaishil Sulphur and Chemical Industries",
}


def normalize_contractor(name):
    """
    Map a raw OCR contractor name to one of the known canonical names.
    Steps:
      1. Check manual fix table (catches common OCR patterns).
      2. Fuzzy match against the valid list (cutoff 0.45 — generous for
         partially garbled handwriting).
      3. Return original if no match found.
    """
    if not name:
        return "UNKNOWN"

    name = name.strip()

    # Step 1 — exact manual fix
    if name in MANUAL_FIXES:
        return MANUAL_FIXES[name]

    # Step 2 — fuzzy match
    match = get_close_matches(name, VALID_CONTRACTORS, n=1, cutoff=0.45)
    if match:
        return match[0]

    # Step 3 — no match
    return name


def find_employee_row(ws, employee_name):

    for row in range(1, ws.max_row + 1):

        value = ws.cell(row, 1).value

        if value == employee_name:
            return row

    return None


def calculate_work_hours(in_time, out_time):

    try:

        in_dt = datetime.strptime(in_time, "%H:%M")
        out_dt = datetime.strptime(out_time, "%H:%M")

        # Handle night shift crossing midnight
        if out_dt < in_dt:
            out_dt += timedelta(days=1)

        total_minutes = int((out_dt - in_dt).total_seconds() / 60)

        hours = total_minutes // 60
        minutes = total_minutes % 60

        return f"{hours:02}:{minutes:02}"

    except:
        return "00:00"


def calculate_overtime(in_time, out_time):

    try:

        in_dt = datetime.strptime(in_time, "%H:%M")
        out_dt = datetime.strptime(out_time, "%H:%M")

        # Handle night shift crossing midnight
        if out_dt < in_dt:
            out_dt += timedelta(days=1)

        total_minutes = int((out_dt - in_dt).total_seconds() / 60)

        overtime_minutes = max(0, total_minutes - 480)  # 8 hours standard

        hours = overtime_minutes // 60
        minutes = overtime_minutes % 60

        return f"{hours:02}:{minutes:02}"

    except:
        return "00:00"


def process_attendance(all_data):

    # Refresh the worker names master list in case the Excel file was updated
    load_master_list()

    structured = defaultdict(
        lambda: {
            "DAY": defaultdict(dict),
            "NIGHT": defaultdict(dict)
        }
    )

    last_contractor = "UNKNOWN"
    for row in all_data:

        contractor = row.get("contractor", "").strip()
        
        # Try to normalize the contractor name
        normalized = normalize_contractor(contractor) if contractor else "UNKNOWN"
        
        if normalized in VALID_CONTRACTORS:
            contractor = normalized
            last_contractor = normalized
        else:
            # If not a valid contractor name, carry forward the previous valid one if we have it
            if last_contractor != "UNKNOWN":
                contractor = last_contractor
            else:
                contractor = "UNKNOWN"

        print(f"RAW CONTRACTOR: '{row.get('contractor')}' -> FINAL: '{contractor}'")

        shift = row.get("shift", "DAY").strip().upper()
        if shift not in ["DAY", "NIGHT"]:
            shift = "DAY"

        employee = row.get("employee_name", "").strip()
        employee = correct_employee_name(employee)
        date = row.get("date", "")
        in_time = row.get("in_time", "")
        out_time = row.get("out_time", "")

        if not employee:
            continue

        if not date:
            continue

        try:
            day = int(date.split("-")[-1])
        except:
            continue

        work_hours = calculate_work_hours(in_time, out_time)
        overtime = calculate_overtime(in_time, out_time)

        print(
            f"  Contractor='{contractor}'  Shift='{shift}'  "
            f"Employee='{employee}'  Date='{date}'"
        )

        structured[contractor][shift][employee][day] = {
            "in": in_time,
            "out": out_time,
            "work_hours": work_hours,
            "ot": overtime
        }

    return structured


def update_summary_columns(ws):

    max_row = ws.max_row
    row = 6
    while row <= max_row:
        val_1 = ws.cell(row, 1).value
        val_2 = ws.cell(row, 2).value
        
        # Check if shift header
        if val_1 and "SHIFT" in str(val_1).upper():
            row += 1
            continue
            
        if val_1 and val_2 == "IN":
            has_total_row = (ws.cell(row + 2, 2).value == "TOTAL")
            ot_offset = 3 if has_total_row else 2
            
            total_days = 0
            total_ot_minutes = 0

            for col in range(3, 34):
                in_value = ws.cell(row, col).value
                ot_value = ws.cell(row + ot_offset, col).value

                if in_value:
                    total_days += 1

                if ot_value:
                    try:
                        h, m = map(int, str(ot_value).split(":"))
                        total_ot_minutes += h * 60 + m
                    except:
                        pass

            total_ot_hours = total_ot_minutes // 60
            total_ot_remaining = total_ot_minutes % 60
            ot_days = round(total_ot_minutes / 60 / 8, 2)

            ws.cell(row, 34).value = total_days
            ws.cell(row, 35).value = f"{total_ot_hours:02}:{total_ot_remaining:02}"
            ws.cell(row, 36).value = ot_days
            
            row += 5 if has_total_row else 4
            continue
        row += 1
