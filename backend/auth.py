import jwt
import hashlib
import datetime

SECRET_KEY = "t-sheet-secret-key-2024-aec"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 8


def hash_password(password: str) -> str:
    """Simple SHA256 hash for hardcoded passwords."""
    return hashlib.sha256(password.encode()).hexdigest()


# Predefined users with roles
USERS = {
    "admin": {
        "password": hash_password("admin123"),
        "role": "admin",
        "display_name": "Administrator"
    },
    "examcell": {
        "password": hash_password("exam123"),
        "role": "examcell",
        "display_name": "Exam Cell Incharge"
    },
    "viewer": {
        "password": hash_password("view123"),
        "role": "viewer",
        "display_name": "Viewer"
    }
}


def authenticate_user(username: str, password: str):
    """Verify username and password, return user info or None."""
    user = USERS.get(username)
    if not user or user["password"] != hash_password(password):
        return None
    return {
        "username": username,
        "role": user["role"],
        "display_name": user["display_name"]
    }


def create_token(username: str, role: str):
    """Create a JWT token with username and role."""
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    """Verify and decode a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username not in USERS:
            return None
        return {
            "username": username,
            "role": payload.get("role"),
            "display_name": USERS[username]["display_name"]
        }
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
