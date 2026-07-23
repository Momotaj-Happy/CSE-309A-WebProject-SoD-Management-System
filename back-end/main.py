import sys
from pathlib import Path

# Force Python to include the current folder (back-end) in the search path
sys.path.append(str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.schedule import router as schedule_router

app = FastAPI(title="Simple Schedule Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schedule_router)