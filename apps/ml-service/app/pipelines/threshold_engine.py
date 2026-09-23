import pandas as pd
import numpy as np
from app.core.config import *

# =====================================================
# STEP 4: RANDOM FOREST PREDICTIONS
# STEP 4.2: THRESHOLD ENGINE
# =====================================================

# =========================================================
# RISK ZONE ENGINE
# =========================================================


def get_risk_zone(value, threshold, reverse=False):
    if reverse:
        if value < threshold:
            return "safe"
        elif value < threshold + threshold * 0.5:
            return "warning"
        else:
            return "breach"
    else:
        if value >= threshold:
            return "safe"
        elif value >= threshold - threshold * 0.5:
            return "warning"
        else:
            return "breach"


# =========================================================
# 2: THRESHOLD CLASSIFICATION ENGINE
# =========================================================


def threshold_classification(df):

    working = df.copy()

    # CEI
    working["CEI_Level"] = np.select(
        [
            working["CEI"] >= THRESHOLD_CEI_HIGH,
            (working["CEI"] >= THRESHOLD_CEI_LOW)
            & (working["CEI"] < THRESHOLD_CEI_HIGH),
            working["CEI"] < THRESHOLD_CEI_LOW,
        ],
        ["Efficient-Stable", "Moderate", "High Risk"],
        default="Undefined",
    )

    # RESILIENCE
    working["Resilience_Level"] = np.select(
        [
            working["Resilience_Index"] >= THRESHOLD_RESILIENCE_HIGH,
            (working["Resilience_Index"] >= THRESHOLD_RESILIENCE_LOW)
            & (working["Resilience_Index"] < THRESHOLD_RESILIENCE_HIGH),
            working["Resilience_Index"] < THRESHOLD_RESILIENCE_LOW,
        ],
        ["Strong", "Moderate", "Weak"],
        default="Undefined",
    )

    # BANKABILITY
    working["Bankability_Level"] = np.select(
        [
            working["Bankability_Index"] >= THRESHOLD_BANKABILITY_HIGH,
            (working["Bankability_Index"] >= THRESHOLD_BANKABILITY_LOW)
            & (working["Bankability_Index"] < THRESHOLD_BANKABILITY_HIGH),
            working["Bankability_Index"] < THRESHOLD_BANKABILITY_LOW,
        ],
        ["Bank Ready", "Partially Ready", "Not Bank Ready"],
        default="Undefined",
    )

    # SCALABILITY
    working["Scalability_Level"] = np.select(
        [
            working["Scalability_Index"] >= THRESHOLD_SCALABILITY_HIGH,
            (working["Scalability_Index"] >= THRESHOLD_SCALABILITY_LOW)
            & (working["Scalability_Index"] < THRESHOLD_SCALABILITY_HIGH),
            working["Scalability_Index"] < THRESHOLD_SCALABILITY_LOW,
        ],
        ["Highly Scalable", "Moderately Scalable", "Low Scalability"],
        default="Undefined",
    )

    return working
