import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.ingestion_routes import router as ingestion_router
from app.api.query_routes import router as query_router
from app.api.upload_routes import router as upload_router
from app.api.summarize_routes import router as summarize_router
from app.api.study_routes import router as study_router
from app.api.documents_routes import router as documents_router

app = FastAPI(
    title="IKAAD Backend API",
    description="Backend service for Intelligent Knowledge Assistant",
    version="0.1.0"
)

# Build allowed origins: localhost for dev + production Vercel URL
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Add production frontend URL if set (e.g. https://ikaad.vercel.app)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(ingestion_router)
app.include_router(query_router)
app.include_router(upload_router)
app.include_router(summarize_router)
app.include_router(documents_router)
app.include_router(study_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}