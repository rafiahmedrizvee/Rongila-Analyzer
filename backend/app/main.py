import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routes.prediction import router as prediction_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skin_tone_api")

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router, prefix=settings.api_prefix)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Don't expose internal implementation details (stack traces, file
    # paths) to the client — log them server-side and return a generic,
    # user-safe message instead, per the project's error-handling and
    # security requirements.
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong while processing your request. Please try again."},
    )


@app.get("/")
async def root():
    return {"service": settings.app_name, "docs": "/docs"}
