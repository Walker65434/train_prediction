from fastapi import APIRouter
from app.schemas.predict_schema import PredictionRequest
from app.services.prediction_service import generate_prediction

router = APIRouter()

# =====================================================
# PREDICT ROUTE
# =====================================================


@router.post("/predict")
def predict(data: PredictionRequest):
    result = generate_prediction(data)
    return result
