FROM python:3.10-slim

# Install system dependencies required for pdf2image, OpenCV, and OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy project files
COPY . .

# Expose port (Render automatically maps this)
EXPOSE 5000

# Start server using Gunicorn with an extended timeout since processing PDFs/LLM calls can take time
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5000} app:app --timeout 300"]
