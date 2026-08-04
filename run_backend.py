import os
import sys

# Automatically locate project root and backend directory
script_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.basename(script_dir) == "backend":
    project_root = os.path.dirname(script_dir)
    backend_dir = script_dir
else:
    project_root = script_dir
    backend_dir = os.path.join(project_root, "backend")

sys.path.insert(0, backend_dir)
os.environ["PYTHONPATH"] = backend_dir

# Load .env configuration explicitly from backend/.env
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Security Workspace Backend on http://127.0.0.1:8000...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False, app_dir=backend_dir, loop="asyncio")
