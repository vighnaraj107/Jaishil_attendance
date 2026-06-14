import os
import re
import pandas as pd
from rapidfuzz import process, utils

# Configs for the master sheet
MASTER_FILE = "Worker_Information_Bank.xlsx"
SHEET_NAME = "Workers Directory"
COLUMN_NAME = "Worker Name"

canonical_names = []

def load_master_list():
    global canonical_names
    if not os.path.exists(MASTER_FILE):
        print(f"WARNING: Master file '{MASTER_FILE}' not found in root. Fuzzy matching disabled.")
        canonical_names = []
        return

    try:
        df = pd.read_excel(MASTER_FILE, sheet_name=SHEET_NAME)
        if COLUMN_NAME in df.columns:
            # Load non-empty names, strip whitespace, and convert to string
            raw_list = df[COLUMN_NAME].dropna().astype(str).str.strip().tolist()
            
            # Filter out header logs or timestamps (e.g. "08/11 : in 19:50...")
            # We exclude any rows containing a colon (":") as worker names won't have colons.
            filtered_list = []
            for name in raw_list:
                name_clean = name.strip()
                if name_clean and ":" not in name_clean:
                    filtered_list.append(name_clean)
            
            canonical_names = list(set(filtered_list))  # Deduplicate
            print(f"Loaded {len(canonical_names)} canonical worker names from '{MASTER_FILE}' ({SHEET_NAME}).")
        else:
            print(f"WARNING: Column '{COLUMN_NAME}' not found in sheet '{SHEET_NAME}' of '{MASTER_FILE}'.")
            canonical_names = []
    except Exception as e:
        print(f"Error loading worker master list from '{MASTER_FILE}': {e}")
        canonical_names = []

# Load names on startup/import
load_master_list()

def correct_employee_name(raw_name):
    """
    Fuzzy matches a raw employee name against the canonical master list.
    Returns the closest match if similarity is >= 80%, otherwise returns raw_name.
    """
    if not raw_name or not canonical_names:
        return raw_name

    raw_clean = str(raw_name).strip()
    if not raw_clean:
        return raw_name

    # Step 1: Exact match check (fastest)
    if raw_clean in canonical_names:
        return raw_clean

    # Step 2: Fuzzy match check
    try:
        # Rapidfuzz extractOne finds the single closest match above cutoff
        match = process.extractOne(
            raw_clean,
            canonical_names,
            processor=utils.default_process,
            score_cutoff=80.0  # 80% similarity threshold
        )
        if match:
            best_match, score, _ = match
            print(f"FUZZY MATCH SUCCESS: '{raw_clean}' -> '{best_match}' (score: {score:.1f}%)")
            return best_match
    except Exception as e:
        print(f"Error executing fuzzy match: {e}")

    return raw_clean
