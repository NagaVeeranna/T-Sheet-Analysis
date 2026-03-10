# 📊 T-Sheet Analytics & Dashboard v2.0

A powerful, high-confidentiality tool for university result analysis. Transform complex academic T-Sheets (PDF) into interactive, visual dashboards and professional reports in seconds.

![Version](https://img.shields.io/badge/version-2.0.0-indigo)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-success)
![React](https://img.shields.io/badge/Frontend-React-blue)
![MUI](https://img.shields.io/badge/UI-Material--UI-blue)

## ✨ Modern Features

### 🔐 Secure Role-Based Access
Designed for data confidentiality with three distinct access levels:
- **Admin**: Full control over data uploads and analysis.
- **Exam Cell Incharge**: Full access to upload T-Sheets and generate reports.
- **Viewer**: Read-only access to dashboards and analytics (no upload permissions).

### 📄 Advanced PDF Extraction
- **Smart Parsing**: Automatically extracts student results, grades, SGPA, and CGPA.
- **Course Code Extraction**: Intelligent identification of course codes from subject names.
- **Error Robust**: Handles complex PDF layouts with precision.

### 📈 Visual Analytics
- **Dynamic Dashboard**: Overview of total students, pass percentage, and top performers.
- **Subject Analysis**: Detailed grade distribution charts and pass/fail metrics for individual subjects.
- **Interactive Charts**: Powered by REcharts for clear performance visualization.

### 📝 Professional PDF Reports
- **One-Click Generation**: Create standardized, printable PDF reports for each subject.
- **Live Statistics**: Automatic computation of *Appeared, Passed, Failed*, and *Absent* counts.
- **Signature Ready**: Includes dedicated sections for HOD and Exam Cell Incharge approvals.

## 🛠️ Tech Stack

- **Backend**: Python 3.12+, FastAPI, PDFPlumber, PyJWT, Hashlib
- **Frontend**: React 18, Vite, Material UI (MUI) v5, REcharts, Axios
- **Reporting**: jsPDF, html2canvas

## ⚙️ Installation & Setup

### 1. Backend Setup
1. Install dependencies:
   ```bash
   pip install fastapi uvicorn pdfplumber pandas python-multipart pyjwt
   ```
2. Run the server:
   ```bash
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` folder:
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

## 📊 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Exam Cell** | `examcell` | `exam123` |
| **Viewer** | `viewer` | `view123` |

## 🚀 Usage

1. Open `http://localhost:5173`.
2. Browse the **Landing Page** to see features.
3. **Sign In** with your authorized credentials.
4. **Upload** a university T-Sheet PDF.
5. **Analyze** results visually and **Download** professional subject reports.

---
Built for **Academic Excellence** and **Data Integrity**.

