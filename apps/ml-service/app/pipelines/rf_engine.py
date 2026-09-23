import joblib

# =========================================================
# Step 4: RANDOM FOREST PREDICTIONS
# Step 4.1: RANDOM FOREST PIPELINE
# =========================================================

# MODEL PATHS
RF_CEI_MODEL_PATH = "app/artifacts/models/rf_cei.pkl"
RF_MR_MODEL_PATH = "app/artifacts/models/rf_mr.pkl"

# =========================================================
# LOAD RF MODELS
# =========================================================


def load_rf_cei_model():
    return joblib.load(RF_CEI_MODEL_PATH)


def load_rf_mr_model():
    return joblib.load(RF_MR_MODEL_PATH)


# =========================================================
# PREDICT CEI
# =========================================================


def predict_cei(df):
    working = df.copy()
    model = load_rf_cei_model()
    X = working[["CI_score", "CU_score", "Profit_score", "WC_eff"]]
    prediction = model.predict(X)
    working["CEI_RF_Prediction"] = prediction
    return working


# =========================================================
# PREDICT MR PROBABILITY
# =========================================================


def predict_mr(df):
    working = df.copy()
    model = load_rf_mr_model()
    X = working[["BRI", "SI", "Cap_lock_normalized", "GPI", "CEI"]]
    prediction = model.predict(X)
    working["MR_RF_Prediction"] = prediction
    return working


# =========================================================
# 1: RF PIPELINE
# =========================================================


def run_rf_pipeline(df):
    working = df.copy()
    working = predict_cei(working)
    working = predict_mr(working)
    return working
