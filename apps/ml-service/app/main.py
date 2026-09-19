from fastapi import FastAPI

app = FastAPI(
    title="Train Prediction ML Service",
    version="1.0.0",
)


@app.get("/health")
async def root():
    return {"message": "✅ ML Service Running !!"}
