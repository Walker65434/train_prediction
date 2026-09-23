import joblib
import numpy as np
import shap

# =====================================================
# STEP 4: RANDOM FOREST PREDICTIONS
# STEP 4.5: GENERATE SHAP EXPLAINATIONS
# =====================================================

# LOAD RF MODELS
rf_cei_model = joblib.load("./app/artifacts/models/rf_cei.pkl")
rf_mr_model = joblib.load("./app/artifacts/models/rf_mr.pkl")

# =========================================================
# CEI FEATURE LABELS
# =========================================================

cei_feature_labels = {
    "CI_score": "Capital Investment Strength",
    "CU_score": "Capacity Utilization",
    "Profit_score": "Profitability Strength",
    "WC_eff": "Working Capital Efficiency",
}

# =========================================================
# MR FEATURE LABELS
# =========================================================

mr_feature_labels = {
    "BRI": "Business Readiness",
    "SI": "Stress Exposure",
    "Cap_lock_normalized": "Capital Lock Pressure",
    "GPI": "Growth Preparedness",
    "CEI": "Operational Efficiency",
}

# =========================================================
# 5: SHAP ENGINE
# =========================================================


def generate_shap_explanations(df):

    working = df.copy()

    # =====================================================
    # CEI SHAP
    # =====================================================

    cei_X = working[["CI_score", "CU_score", "Profit_score", "WC_eff"]]

    cei_explainer = shap.TreeExplainer(rf_cei_model)
    cei_shap_values = cei_explainer.shap_values(cei_X)
    cei_abs = np.abs(cei_shap_values[0])
    cei_top_idx = np.argmax(cei_abs)
    cei_top_feature = cei_X.columns[cei_top_idx]

    working["CEI_SHAP_Driver"] = cei_feature_labels[cei_top_feature]

    # =====================================================
    # MR SHAP
    # =====================================================

    mr_X = working[["BRI", "SI", "Cap_lock_normalized", "GPI", "CEI"]]

    mr_explainer = shap.TreeExplainer(rf_mr_model)
    mr_shap_values = mr_explainer.shap_values(mr_X)
    mr_abs = np.abs(mr_shap_values[0])
    mr_top_idx = np.argmax(mr_abs)
    mr_top_feature = mr_X.columns[mr_top_idx]

    working["MR_SHAP_Driver"] = mr_feature_labels[mr_top_feature]
    return working
