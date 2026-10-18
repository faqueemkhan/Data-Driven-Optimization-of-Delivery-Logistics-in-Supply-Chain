"""
FastAPI Backend Application
Title: Data-Driven Optimization of Delivery Logistics in Supply Chain
Exposes 8 core functional modules with CORS, comprehensive error handling, and health probes.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.data_store import DataStore
from app.routes.overview import router as overview_router
from app.routes.quality import router as quality_router
from app.routes.prediction import router as prediction_router
from app.routes.routes_geo import router as routes_geo_router
from app.routes.performance import router as performance_router
from app.routes.whatif import router as whatif_router
from app.routes.optimization import router as optimization_router
from app.routes.deliveries import router as deliveries_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("AppMain")

app = FastAPI(
    title="Data-Driven Optimization of Delivery Logistics in Supply Chain API",
    description="Enterprise API supporting automated data pipeline, machine learning delay prediction, route GIS analysis, what-if simulations, and supply chain optimization.",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing DataStore and warming ML inference caches...")
    store = DataStore.get_instance()
    df = store.get_data()
    logger.info(f"System ready with {len(df)} logistics records.")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "message": str(exc), "path": request.url.path}
    )

@app.get("/health", tags=["Health"])
def health_check():
    store = DataStore.get_instance()
    df = store.get_data()
    model = store.get_model()
    return {
        "status": "healthy",
        "app_title": "Data-Driven Optimization of Delivery Logistics in Supply Chain",
        "dataset_rows": len(df) if df is not None else 0,
        "ml_model_loaded": bool(model is not None),
        "version": "1.0.0"
    }

# Register all 8 functional modules
app.include_router(overview_router, prefix="/api")
app.include_router(quality_router, prefix="/api")
app.include_router(prediction_router, prefix="/api")
app.include_router(routes_geo_router, prefix="/api")
app.include_router(performance_router, prefix="/api")
app.include_router(whatif_router, prefix="/api")
app.include_router(optimization_router, prefix="/api")
app.include_router(deliveries_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
