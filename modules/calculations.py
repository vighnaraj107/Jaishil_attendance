from datetime import datetime


def calculate_work_hours(in_time, out_time):

    try:

        in_dt = datetime.strptime(in_time, "%H:%M")
        out_dt = datetime.strptime(out_time, "%H:%M")

        total_minutes = int((out_dt - in_dt).total_seconds() / 60)

        # Handle night shift crossing midnight
        if total_minutes < 0:
            total_minutes += 24 * 60

        hours = total_minutes // 60
        minutes = total_minutes % 60

        return f"{hours:02}:{minutes:02}"

    except:
        return "00:00"


def calculate_overtime(work_hours):

    try:

        hours, minutes = map(int, work_hours.split(":"))

        total_minutes = hours * 60 + minutes

        overtime_minutes = max(0, total_minutes - 480)  # 8 hours standard

        ot_hours = overtime_minutes // 60
        ot_minutes = overtime_minutes % 60

        return f"{ot_hours:02}:{ot_minutes:02}"

    except:
        return "00:00"
