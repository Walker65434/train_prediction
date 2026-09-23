import joblib
import pandas as pd

# =====================================================
# STEP 4: RANDOM FOREST PREDICTIONS
# STEP 4.4: GENERATE BEHAVIORAL INTELLIGENCE
# =====================================================


# =========================================================
# LOAD TRAINED MLP MODEL
# =========================================================

mlp_model = joblib.load("./app/artifacts/models/mlp_cluster_classifier.pkl")

# =========================================================
# CLUSTER NAME MAP
# =========================================================

cluster_name_map = {
    0: "Capital-Starved",
    1: "Efficient-Stable",
    2: "Fragile Expansion",
    3: "Debt-Trapped Growth",
}

# =========================================================
# 4: PREDICT BUSINESS ARCHETYPE USING MLP
# =========================================================


def generate_behavioral_intelligence(df):

    working = df.copy()

    # DEFINE FEATURE MATRIX
    X = pd.DataFrame(
        {
            "annual_profit_normalized": working["annual_profit_normalized"],
            "annual_turnover_normalized": working["annual_turnover_normalized"],
            "SI": working["SI"],
            "CEI": working["CEI"],
            "MR_prob": working["MR_RF_Prediction"],
            "CLI": working["Cap_lock_normalized"],
            "CRI": working["Bankability_Index"],
            "GQI": working["MRI"],
            "SAC": working["Sustainability_Index"],
            "CTI": working["Scalability_Index"],
        }
    )

    # PREDICT CLUSTER
    cluster_prediction = mlp_model.predict(X)

    # PREDICT PROBABILITIES
    probabilities = mlp_model.predict_proba(X)

    # CONFIDENCE SCORE
    confidence = probabilities.max(axis=1)

    # STORE RESULTS
    working["Predicted_Cluster"] = cluster_prediction
    working["Business_Archetype"] = working["Predicted_Cluster"].map(cluster_name_map)
    working["Cluster_Confidence"] = confidence.round(4)
    return working
