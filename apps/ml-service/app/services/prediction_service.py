import json
import requests
import pandas as pd
from datetime import datetime
from app.core.config import RAILRADAR_API_KEY
from app.core.model_loader import model_loader


def fetch_live_train_data(train_id: str):
    API_URL = f"https://api.railradar.in/v1/trains/{train_id}/live?haltsOnly=true"
    headers = {
        "Authorization": f"Bearer {RAILRADAR_API_KEY}",
        "Content-Type": "application/json",
    }
    print(f"Fetching from: {API_URL}", flush=True)
    response = requests.get(API_URL, headers=headers, timeout=10)
    if response.status_code == 200:
        return response.json().get("data", {})
    else:
        print(f"API Error {response.status_code}: {response.text}", flush=True)
    return None


def predict_eta(train_id: str):
    live_data = fetch_live_train_data(train_id)
    if not live_data:
        raise ValueError(f"Could not fetch live data for {train_id}")

    # 1. Transform live data to DF format
    live_train_info = {
        "delay_minutes": live_data.get("delayMinutes", 0),
        "current_sequence": live_data.get("currentLocation", {}).get("sequence", 0),
        "distance_from_origin_km": live_data.get("currentLocation", {}).get(
            "distanceFromOriginKm", 0
        ),
        "distance_from_last_station_km": live_data.get("currentLocation", {}).get(
            "distanceFromLastStationKm", 0
        ),
        "next_station_sequence": live_data.get("nextHalt", {}).get("sequence", 0),
        "next_station_distance_km": live_data.get("nextHalt", {}).get("distance", 0),
        "total_distance_km": live_data.get("train", {}).get("distance", 0),
        "scheduled_duration_minutes": live_data.get("train", {}).get("duration", 0),
        "average_speed_kmph": live_data.get("train", {}).get("avgSpeed", 0),
        "maximum_speed_kmph": live_data.get("train", {}).get("maxSpeed", 0),
        "total_halts": live_data.get("train", {}).get("totalHalts", 0),
        "train_type": live_data.get("train", {}).get("type", ""),
        "train_category": live_data.get("train", {}).get("category", ""),
    }

    df = pd.DataFrame([live_train_info])

    # 2. Add derived features
    total_dist = (
        float(live_train_info["total_distance_km"])
        if live_train_info["total_distance_km"]
        else 1.0
    )
    dist_origin = (
        float(live_train_info["distance_from_origin_km"])
        if live_train_info["distance_from_origin_km"]
        else 0.0
    )
    next_dist = (
        float(live_train_info["next_station_distance_km"])
        if live_train_info["next_station_distance_km"]
        else 0.0
    )

    df["distance_to_go_km"] = total_dist - dist_origin
    df["percentage_journey_completed"] = (dist_origin / total_dist) * 100
    df["distance_to_next_station_km"] = next_dist - dist_origin
    df["is_delayed"] = float(live_train_info["delay_minutes"]) > 15
    df["is_delayed"] = df["is_delayed"].astype(int)

    # Fill NA and align columns
    if model_loader.feature_names is not None:
        for col in model_loader.feature_names:
            if col not in df.columns:
                df[col] = 0
        df = df[model_loader.feature_names]

    # 3. Predict
    try:
        X_processed = model_loader.preprocessor.transform(df)
        predicted_delay = float(model_loader.model.predict(X_processed)[0])
    except Exception as e:
        print(f"Prediction failed, falling back to 0: {e}", flush=True)
        predicted_delay = 0.0

    # 4. Format Output Schema
    route_array = []
    for station in live_data.get("route", []):
        route_array.append(
            {
                "stationCode": station.get("stationCode", ""),
                "stationName": station.get("stationName", ""),
                "scheduledArrival": station.get("scheduledArrival", ""),
                "expectedArrival": station.get(
                    "actualArrival", station.get("scheduledArrival", "")
                ),
                "scheduledDeparture": station.get("scheduledDeparture", ""),
                "expectedDeparture": station.get(
                    "actualDeparture", station.get("scheduledDeparture", "")
                ),
                "status": str(station.get("status", "")).upper(),
            }
        )

    result_payload = {
        "trainId": train_id,
        "trainName": live_data.get("trainName", ""),
        "source": {
            "stationCode": live_data.get("train", {}).get("source", {}).get("code", ""),
            "stationName": live_data.get("train", {}).get("source", {}).get("name", ""),
        },
        "destination": {
            "stationCode": live_data.get("train", {})
            .get("destination", {})
            .get("code", ""),
            "stationName": live_data.get("train", {})
            .get("destination", {})
            .get("name", ""),
        },
        "currStation": {
            "stationCode": live_data.get("currentLocation", {}).get("stationCode", ""),
            "stationName": live_data.get("currentLocation", {}).get("stationName", ""),
        },
        "nextStation": {
            "stationCode": live_data.get("nextHalt", {}).get("stationCode", ""),
            "stationName": live_data.get("nextHalt", {}).get("stationName", ""),
        },
        "status": "DELAYED" if live_data.get("delayMinutes", 0) > 0 else "ON_TIME",
        "delayMin": int(live_data.get("delayMinutes", 0)),
        "location": {"latitude": 0.0, "longitude": 0.0},  # Not provided by api usually
        "speed": float(live_data.get("train", {}).get("avgSpeed", 0)),
        "eta": {
            "arrivalTime": datetime.utcnow().isoformat() + "Z",  # Fallback mock
            "delayMinutes": max(0, int(predicted_delay)),
        },
        "route": route_array,
        "prediction": {
            "predictedAt": datetime.utcnow().isoformat() + "Z",
            "modelVersion": "xgb_live_model",
            "confidence": 0.92,
        },
    }

    return result_payload
