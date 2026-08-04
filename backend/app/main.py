from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router as api_router

# Increase multipart spool threshold so large files go to disk not RAM
import tempfile
from starlette.formparsers import MultiPartParser
MultiPartParser.max_file_size = 2 * 1024 * 1024 * 1024  # 2GB limit

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

app.include_router(api_router, prefix=settings.API_V1_STR)

import asyncio
import httpx
import logging

logger = logging.getLogger("uvicorn")

async def keep_alive():
    import os
    url = os.getenv("RENDER_EXTERNAL_URL")
    if not url:
        logger.info("RENDER_EXTERNAL_URL not set. Skipping self-ping keep-alive task.")
        return
    
    logger.info(f"Starting self-ping keep-alive task targeting: {url}")
    await asyncio.sleep(60)
    async with httpx.AsyncClient() as client:
        while True:
            try:
                response = await client.get(url, timeout=10.0)
                logger.info(f"Self-ping successful: {response.status_code}")
            except Exception as e:
                logger.warning(f"Self-ping failed: {e}")
            await asyncio.sleep(600)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(keep_alive())

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
