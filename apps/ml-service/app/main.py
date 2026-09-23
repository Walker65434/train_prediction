from fastapi import FastAPI
from contextlib import asynccontextmanager
from threading import Thread
from app.workers.consumers import start_consumer
from app.core.model_loader import model_loader

# =====================================================
# LIFESPAN
# =====================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # LOAD ML MODELS
    model_loader.load()
    
    print("Starting RabbitMQ Consumer...", flush=True)

    # START RABBITMQ CONSUMER
    consumer_thread = Thread(target=start_consumer, daemon=True)
    consumer_thread.start()

    print("RabbitMQ Consumer Started", flush=True)

    yield

    print("Shutting down application...", flush=True)

# =====================================================
# FASTAPI APP
# =====================================================

app = FastAPI(title="Train Prediction ML Service", lifespan=lifespan)

# =====================================================
# ROOT
# =====================================================

@app.get("/health")
async def root():
    return {"message": "Train Prediction ML Service Running !!"}
