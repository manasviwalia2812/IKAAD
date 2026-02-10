from fastapi import FastAPI
from app.api.routes import router
from app.api.ingestion_routes import router as ingestion_router

app = FastAPI(
    title="IKAAD Backend API",
    description="Backend service for Intelligent Knowledge Assistant",
    version="0.1.0"
)

app.include_router(router)
app.include_router(ingestion_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
