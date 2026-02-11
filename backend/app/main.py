from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ← Add this import
from app.api.routes import router
from app.api.ingestion_routes import router as ingestion_router
from app.api.query_routes import router as query_router
from app.api.upload_routes import router as upload_router

app = FastAPI(
    title="IKAAD Backend API",
    description="Backend service for Intelligent Knowledge Assistant",
    version="0.1.0"
)

# ← Add CORS middleware BEFORE including routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # React default
        "http://localhost:5173",      # Vite default
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],              # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],              # Allows all headers
)

app.include_router(router)
app.include_router(ingestion_router)
app.include_router(query_router)
app.include_router(upload_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}