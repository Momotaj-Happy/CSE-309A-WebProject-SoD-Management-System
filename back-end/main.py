from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.schedule import router as schedule_router

app = FastAPI(title="Simple Schedule Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schedule_router)