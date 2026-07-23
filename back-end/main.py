from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, users

app = FastAPI(
    title="Departmental SoD Management System API",
    description="API services for Student on Duty (SoD) Management System, supporting User Auth, Role Management, and Scheduling.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with /api/v1 prefix
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")


@app.get("/", tags=["Health Check"])
def read_root():
    return {
        "status": "online",
        "system": "Departmental SoD Management System Backend",
        "api_docs": "/docs",
        "version": "1.0.0"
    }
