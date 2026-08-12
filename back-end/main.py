import sys
from pathlib import Path

# Force Python to include the current folder (back-end) in the search path
sys.path.append(str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, users, tasks, swaps, export, billing
from api.routes.schedule import router as schedule_router

app = FastAPI(
    title="Departmental SoD Management System API",
    description="API services for Student on Duty (SoD) Management System, supporting User Auth, Role Management, Duty Tasks, and Scheduling.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(swaps.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(schedule_router, prefix="/api/v1")
app.include_router(schedule_router, prefix="/api")
app.include_router(schedule_router)


@app.get("/", tags=["Health Check"])
def read_root():
    return {
        "status": "online",
        "system": "Departmental SoD Management System Backend",
        "api_docs": "/docs",
        "version": "1.0.0"
    }
