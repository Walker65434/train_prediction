import numpy as np

# =====================================================
# STEP 4 — RANDOM FOREST PREDICTIONS
# STEP 4.3 — INTERPRETATION ACTION GRID
# =====================================================


def interpretation_action_grid(df):

    working = df.copy()

    # =====================================================
    # PRIMARY STRENGTH
    # =====================================================

    working["Primary_Strength"] = np.select(
        [
            working["CEI"] >= 1.0,
            working["Resilience_Index"] >= 0.75,
            working["Bankability_Index"] >= 0.75,
        ],
        [
            "Strong Operational Efficiency",
            "Strong Financial Resilience",
            "Strong Credit Readiness",
        ],
        default="Moderate Business Stability",
    )

    # =====================================================
    # PRIMARY RISK
    # =====================================================

    working["Primary_Risk"] = np.select(
        [
            working["MRI"] < 0.30,
            working["SI"] >= 0.75,
            working["Scalability_Index"] < 0.30,
        ],
        [
            "Weak Governance Structure",
            "High Financial Stress",
            "Low Scalability Readiness",
        ],
        default="Manageable Risk Exposure",
    )

    # =====================================================
    # STRATEGIC ACTION
    # =====================================================

    working["Strategic_Action"] = np.select(
        [
            working["MRI"] < 0.30,
            working["SI"] >= 0.75,
            working["Scalability_Index"] < 0.30,
        ],
        [
            "Improve governance systems and financial monitoring.",
            "Reduce financial stress and improve liquidity discipline.",
            "Delay aggressive expansion until operational readiness improves.",
        ],
        default="Maintain current business discipline and growth strategy.",
    )

    return working
