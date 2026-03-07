# T-Sheet Dashboard Setup

## Prerequisites
- **Python 3.8+**
- **Node.js 16+**

## Installation

### Backend
1. Open terminal in `d:\T-SHEET`
2. Run: `pip install fastapi uvicorn pdfplumber pandas python-multipart`

### Frontend
1. Open terminal in `d:\T-SHEET\frontend`
2. Run: `npm install`

## How to Run

### Step 1: Backend
```powershell
cd d:\T-SHEET
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 2: Frontend
```powershell
cd d:\T-SHEET\frontend
npm run dev
```

## Dashboard URLs
- **Web Interface**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs
