# T-Sheet Analysis & Dashboard

A comprehensive tool for analyzing T-Sheets (Academic Result Sheets) with a modern web dashboard. This project provides an automated way to extract data from T-Sheet PDFs and visualize academic performance.

## 🚀 Features

- **Automated Data Extraction**: Extracts student results, marks, and grades from PDF T-Sheets.
- **Interactive Dashboard**: Visualize performance metrics, subject-wise analysis, and student records.
- **FastAPI Backend**: High-performance Python backend for PDF processing.
- **Vite + React Frontend**: Modern, responsive user interface.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, PDFPlumber, Pandas
- **Frontend**: React, Vite, CSS (Modern Premium Design)
- **Deployment**: Local / Server-ready

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**

## ⚙️ Installation & Setup

### 1. Backend Setup
1. Standardize dependencies:
   ```bash
   pip install fastapi uvicorn pdfplumber pandas python-multipart
   ```
2. Run the development server:
   ```bash
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📊 Usage

1. Open the dashboard at `http://localhost:5173`.
2. Upload your T-Sheet PDF files.
3. View real-time analysis and reports.
4. Export data or view detailed student metrics.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
