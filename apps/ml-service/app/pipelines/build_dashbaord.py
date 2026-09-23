from app.core.config import *
from app.pipelines.threshold_engine import get_risk_zone

# =========================================================
# Step 5: BUILD DASHBOARD
# =========================================================

# =========================================================
# 1: OUTPUT GENERATION
# =========================================================


def build_dashboard_output(df):

    row = df.iloc[0]

    # =====================================================
    # OVERALL RISK ZONE
    # =====================================================

    overall_risk_zone = "safe"

    if (
        row["SI"] >= DASHBOARD_RISK_ZONE_SAFE_SI
        or row["MRI"] < DASHBOARD_RISK_ZONE_SAFE_MRI
        or row["Scalability_Index"] < DASHBOARD_RISK_ZONE_SAFE_SCALABILITY
    ):
        overall_risk_zone = "warning"

    if (
        row["SI"] >= DASHBOARD_RISK_ZONE_WARNING_SI
        or row["MRI"] < DASHBOARD_RISK_ZONE_WARNING_MRI
    ):
        overall_risk_zone = "breach"

    # =====================================================
    # DASHBOARD
    # =====================================================

    dashboard = {
        "business_summary": {
            "classification": row["Business_Archetype"],
            "primary_strength": row["Primary_Strength"],
            "primary_risk": row["Primary_Risk"],
            "overall_risk_zone": overall_risk_zone,
        },
        "behavioral_intelligence": {
            "confidence": round(float(row["Cluster_Confidence"]), 2),
            "cei_shap_driver": row["CEI_SHAP_Driver"],
            "mr_shap_driver": row["MR_SHAP_Driver"],
        },
        "metrics": {
            "CEI": {
                "value": round(row["CEI"], 4),
                "risk_cliff": DASHBOARD_CEI,
                "risk_zone": get_risk_zone(row["CEI"], DASHBOARD_CEI),
                "interpretation": (
                    "Business operations demonstrate efficient capital utilization and healthy operational productivity."
                    if row["CEI"] >= DASHBOARD_CEI
                    else "Operational efficiency and capital utilization appear below expected business benchmarks."
                ),
                "strategic_action": (
                    "Maintain operational discipline while scaling gradually."
                    if row["CEI"] >= DASHBOARD_CEI
                    else "Improve productivity, optimize asset utilization, and strengthen working capital efficiency."
                ),
            },
            "MRI": {
                "value": round(row["MRI"], 4),
                "risk_cliff": DASHBOARD_MRI,
                "risk_zone": get_risk_zone(row["MRI"], DASHBOARD_MRI),
                "interpretation": (
                    "Management systems and governance practices indicate moderate operational control."
                    if row["MRI"] >= DASHBOARD_MRI
                    else "Weak governance structure and poor financial management discipline may affect sustainability."
                ),
                "strategic_action": (
                    "Strengthen governance controls and improve financial monitoring systems."
                    if row["MRI"] < DASHBOARD_MRI
                    else "Maintain disciplined management and operational monitoring."
                ),
            },
            "SI": {
                "value": round(row["SI"], 4),
                "risk_cliff": DASHBOARD_SI,
                "risk_zone": get_risk_zone(row["SI"], DASHBOARD_SI, reverse=True),
                "interpretation": (
                    "Financial stress exposure remains within manageable levels."
                    if row["SI"] < DASHBOARD_SI
                    else "Business is showing elevated financial stress and repayment pressure."
                ),
                "strategic_action": (
                    "Maintain liquidity discipline and monitor expenses carefully."
                    if row["SI"] < DASHBOARD_SI
                    else "Reduce financial pressure by restructuring expenses and improving cash flow."
                ),
            },
            "CLI": {
                "value": round(row["Cap_lock_normalized"], 4),
                "risk_cliff": DASHBOARD_CLI,
                "risk_zone": get_risk_zone(
                    row["Cap_lock_normalized"], DASHBOARD_CLI, reverse=True
                ),
                "interpretation": (
                    "Working capital movement is healthy with manageable inventory and receivable cycles."
                    if row["Cap_lock_normalized"] < DASHBOARD_CLI
                    else "Excess capital is locked in inventory or delayed receivables."
                ),
                "strategic_action": (
                    "Improve receivable collection efficiency and optimize inventory cycles."
                    if row["Cap_lock_normalized"] >= DASHBOARD_CLI
                    else "Maintain current working capital discipline."
                ),
            },
            "CRI": {
                "value": round(row["Bankability_Index"], 4),
                "risk_cliff": DASHBOARD_CRI,
                "risk_zone": get_risk_zone(row["Bankability_Index"], DASHBOARD_CRI),
                "interpretation": (
                    "Business demonstrates acceptable financial credibility for formal credit access."
                    if row["Bankability_Index"] >= DASHBOARD_CRI
                    else "Low financial readiness may reduce access to institutional credit."
                ),
                "strategic_action": (
                    "Strengthen documentation quality and repayment discipline."
                    if row["Bankability_Index"] < DASHBOARD_CRI
                    else "Explore formal lending opportunities for structured expansion."
                ),
            },
            "SAC": {
                "value": round(row["Sustainability_Index"], 4),
                "risk_cliff": DASHBOARD_SAC,
                "risk_zone": get_risk_zone(row["Sustainability_Index"], DASHBOARD_SAC),
                "interpretation": (
                    "Financial reserves and sustainability conditions are stable."
                    if row["Sustainability_Index"] >= DASHBOARD_SAC
                    else "Long-term sustainability buffer appears weak under current operating conditions."
                ),
                "strategic_action": (
                    "Build stronger reserves and improve financial sustainability planning."
                    if row["Sustainability_Index"] < DASHBOARD_SAC
                    else "Maintain sustainable financial practices and reserve discipline."
                ),
            },
            "CTI": {
                "value": round(row["Scalability_Index"], 4),
                "risk_cliff": DASHBOARD_CTI,
                "risk_zone": get_risk_zone(row["Scalability_Index"], DASHBOARD_CTI),
                "interpretation": (
                    "Business growth readiness is currently limited by operational scalability constraints."
                    if row["Scalability_Index"] < DASHBOARD_CTI
                    else "Business demonstrates healthy scalability and structured expansion readiness."
                ),
                "strategic_action": (
                    "Delay aggressive expansion until scalability and operational readiness improve."
                    if row["Scalability_Index"] < DASHBOARD_CTI
                    else "Proceed with phased and strategically planned expansion."
                ),
            },
        },
    }

    return dashboard
