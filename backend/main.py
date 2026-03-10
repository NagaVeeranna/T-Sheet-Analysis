from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
from .extractor import extract_t_sheet_data
from .auth import authenticate_user, create_token, verify_token

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


class LoginRequest(BaseModel):
    username: str
    password: str


def get_current_user(authorization: str = Header(None)):
    """Extract and verify user from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user


@app.get("/")
async def root():
    return {"message": "T-Sheet Result Extraction API"}


@app.post("/login")
async def login(request: LoginRequest):
    user = authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_token(user["username"], user["role"])
    return {
        "token": token,
        "username": user["username"],
        "role": user["role"],
        "display_name": user["display_name"]
    }


@app.get("/me")
async def get_me(authorization: str = Header(None)):
    user = get_current_user(authorization)
    return user


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...), authorization: str = Header(None)):
    user = get_current_user(authorization)

    # Viewer role cannot upload
    if user["role"] == "viewer":
        raise HTTPException(status_code=403, detail="Viewers are not allowed to upload files")

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        data = extract_t_sheet_data(file_path)
        return {
            "filename": file.filename,
            "studentCount": len(data["results"]),
            "subjects": data["subjects"],
            "results": data["results"],
            "metadata": data.get("metadata", {}),
            "courseCodes": data.get("courseCodes", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
