from fastapi import FastAPI

app = FastAPI(
    title="IKAAD Backend API",
    description="Backend service for Intelligent Knowledge Assistant",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    return {"status": "ok"}
