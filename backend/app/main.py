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

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)
else:
    # Warn loudly in logs so you never miss this again
    print("WARNING: FRONTEND_URL env var not set. Production CORS will fail.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # explicit OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # cache preflight for 10 min
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