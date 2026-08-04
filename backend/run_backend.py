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

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Security Workspace Backend on http://127.0.0.1:8000...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        app_dir=backend_dir,
        # Allow large log file uploads (up to 2GB)
        limit_max_requests=None,
        timeout_keep_alive=300,  # 5 min keep-alive for large uploads
    )
