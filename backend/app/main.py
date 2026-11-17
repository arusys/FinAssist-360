import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.api_v1 import api_router
from app.seed_data import seed_database
import app.models  # Ensure all models are registered with Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("finassist360")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables and seed sample data
    logger.info("Initializing FinAssist 360 database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown
    logger.info("FinAssist 360 backend shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise GenAI-Based Banking Service Management Platform (FinAssist 360)",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for flexible local development and preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routes under /api
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "FinAssist 360 Backend",
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
