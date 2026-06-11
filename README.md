# Jaishil Attendance Intel

An automated attendance extraction and management system that processes physical or scanned attendance sheets in PDF format, performs OCR, extracts structured attendance details using Anthropic's Claude API, and compiles them into beautifully formatted monthly Excel reports. The project also features a modern React-based dashboard for reviewing, editing, and downloading the reports.

## Features

- **Automated PDF Processing**: Converts attendance sheet PDFs into cleaned images to optimize text recognition.
- **AI-Powered OCR**: Leverages Anthropic's Claude API to extract structured contractor names, employee names, shifts (Day/Night), and daily in/out/overtime records.
- **Excel Report Generation**: Groups extracted data by month and compiles it into styled spreadsheets with custom styling using `openpyxl`.
- **Interactive Dashboard**: A modern web interface to upload PDFs, visualize monthly attendance grids, perform manual edits, and download the resulting sheets.

---

## Project Structure

```text
jaishil-attendance/
├── app.py                     # Flask API Server (Backend)
├── main.py                    # CLI Script to process PDFs in bulk
├── requirements.txt           # Python backend dependencies
├── .env                       # Environment variables (API Keys, etc.)
├── .gitignore                 # Git ignore rules
│
├── modules/                   # Backend helper modules
│   ├── pdf_to_image.py        # PDF page extraction as images
│   ├── image_cleaner.py       # Image preprocessing with OpenCV & Pillow
│   ├── claude_extractor.py    # LLM-based structured data extraction
│   ├── attendance_processor.py# Attendance formatting and calculations
│   └── excel_generator.py     # Excel spreadsheet creation and formatting
│
├── attendance-intel/          # React + Vite Frontend App (TypeScript)
│   ├── src/                   # React source files
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
│
# Data Directories (Ignored in Git, kept via .gitkeep)
├── input_pdfs/                # Directory for placing raw PDFs to process
├── processed_pdfs/            # Archive directory for successfully processed PDFs
├── output_excels/             # Generated monthly Excel reports
├── temp_images/               # Temporary working images for OCR
└── ocr_output/                # Intermediate OCR output text files
```

---

## Setup & Running Locally

### Backend Setup (Python)

1. **Create and Activate a Virtual Environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Anthropic API Key:
   ```env
   ANTHROPIC_API_KEY=your_claude_api_key_here
   ```

4. **Run the Flask Server:**
   ```bash
   python app.py
   ```
   The backend API will run on `http://localhost:5000`.

---

### Frontend Setup (React/Vite)

1. **Navigate to the Frontend Directory:**
   ```bash
   cd attendance-intel
   ```

2. **Install Dependencies:**
   Using `npm` or `bun`:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   The frontend dashboard will be available at `http://localhost:8080` or similar.

---

## Technical Details

- **Backend Stack**: Flask, Openpyxl, OpenCV, Pillow, PyMuPDF/pdf2image, Anthropic SDK.
- **Frontend Stack**: React, Vite, Tailwind CSS, Lucide Icons, Shadcn/ui, TanStack.
- **OCR Engine**: Claude-3 Sonnet/Haiku via image vision processing, with fallback date detection from filename.

---

## Author

- **Vighnaraj kakade** 

