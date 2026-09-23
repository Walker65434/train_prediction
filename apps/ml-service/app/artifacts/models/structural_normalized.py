import pandas as pd
import numpy as np


def generate_risk_report(company_df):

    working = company_df.copy()


# =========================================================
# LOAD STATIC BENCHMARK MATRIX
# =========================================================

benchmark_df = pd.read_csv(
    "./app/artifacts/models/data/MSME Sectoral Benchmark Matrix (FY 2024-25).csv"
)


# =========================================================
# Step 1:STRUCTURAL NORMALIZATION
# =========================================================

# =========================================================
# SIGMOID NORMALIZATION FUNCTION
# =========================================================


def sigmoid_normalize(series):

    shift = abs(series.min()) + 1 if series.min() <= -1 else 0

    x = np.log1p(series + shift)

    std = x.std()

    # Prevent division by zero
    if std == 0 or np.isnan(std):

        z = 0

    else:

        z = (x - x.mean()) / std

    return 1 / (1 + np.exp(-z))


# =========================================================
# STRUCTURAL NORMALIZATION
# =========================================================


def structural_normalization(company_df):

    working = company_df.merge(
        benchmark_df, left_on="business_type", right_on="Industry", how="left"
    )

    # -----------------------------------------------------
    # CAPITAL INTENSITY SCORE
    # -----------------------------------------------------

    working["CI_score"] = working["Sector_Median_CI"] / (
        working["total_assets_value"] / working["annual_turnover"]
    )

    # -----------------------------------------------------
    # CAPACITY UTILIZATION SCORE
    # -----------------------------------------------------

    working["CU_score"] = (working["capacity_used_pct"] / 100) / working[
        "Sector_Capacity_Util"
    ]

    # -----------------------------------------------------
    # PROFITABILITY SCORE
    # -----------------------------------------------------

    working["Profit_score"] = (
        working["annual_profit"] / working["annual_turnover"]
    ) / working["Sector_Median_Margin (EBITDA)"]

    # -----------------------------------------------------
    # INVENTORY SCORE
    # -----------------------------------------------------

    working["Inv_score"] = np.where(
        working["inventory_period"] == 0,
        0,
        (working["Sector_Inv_Days"] / working["inventory_period"]),
    )

    # -----------------------------------------------------
    # RECEIVABLE SCORE
    # -----------------------------------------------------

    working["Rec_score"] = np.where(
        working["receivables_cycle"] == 0,
        0,
        (working["Sector_Rec_Days"] / working["receivables_cycle"]),
    )

    return working


# =========================================================
# SIMPLE NORMALIZATION
# =========================================================

# =========================================================
# SIMPLE NORMALIZATION
# =========================================================


def simple_normalization(df):

    working = df.copy()

    # -----------------------------------------------------
    # ORDINAL SCALE FEATURES (1–5)
    # -----------------------------------------------------

    ordinal_max = 5

    working["inventory_planning_normalized"] = (
        working["inventory_planning"] / ordinal_max
    )

    working["spend_review_normalized"] = working["spend_review"] / ordinal_max

    working["decision_maker_normalized"] = working["decision_maker"] / ordinal_max

    working["finances_separate_normalized"] = working["finances_separate"] / ordinal_max

    working["handle_emergency_normalized"] = working["handle_emergency"] / ordinal_max

    working["plans_2y_normalized"] = working["plans_2y"] / ordinal_max

    working["pre_invest_plan_normalized"] = working["pre_invest_plan"] / ordinal_max

    working["financial_statements_normalized"] = (
        working["financial_statements"] / ordinal_max
    )

    working["external_investment_normalized"] = (
        working["external_investment"] / ordinal_max
    )

    working["tracks_cashflows_normalized"] = working["tracks_cashflow"] / ordinal_max

    # -----------------------------------------------------
    # BINARY FEATURES (0/1)
    # -----------------------------------------------------

    binary_max = 1

    working["cash_shortage_1y_normalized"] = working["cash_shortage_1y"] / binary_max

    return working


# =========================================================
# REPAYMENT STATUS NORMALIZATION
# =========================================================


def repayment_normalization(df):

    working = df.copy()

    working["repayment_status_normalized"] = np.where(
        working["repayment_status"] == -1,
        0,
        (working["repayment_status"] / working["repayment_status"].max()),
    )

    return working


# =========================================================
# CAPACITY GAP
# =========================================================


def calculate_capacity_gap(df):

    working = df.copy()

    # Convert percentage to decimal only if needed
    working["capacity_used_pct"] = np.where(
        working["capacity_used_pct"] > 1,
        working["capacity_used_pct"] / 100,
        working["capacity_used_pct"],
    )

    # Capacity Gap
    working["capacity_gap"] = 1 - working["capacity_used_pct"]

    return working


# =========================================================
# SIGMOID BASED FEATURES
# =========================================================


def sigmoid_features(df):

    working = df.copy()

    working["fixed_cost_pct_normalized"] = sigmoid_normalize(working["fixed_cost_pct"])

    working["fulltime_employees_normalized"] = sigmoid_normalize(
        working["fulltime_employees"]
    )

    working["annual_turnover_normalized"] = sigmoid_normalize(
        working["annual_turnover"]
    )

    working["survives_sales_drop_normalized"] = sigmoid_normalize(
        working["survive_sales_drop"]
    )

    working["annual_profit_normalized"] = sigmoid_normalize(working["annual_profit"])

    return working


# =========================================================
# Step 3 : INTERNAL EFFICIENCY RATIOS
# =========================================================


def internal_efficiency_ratios(df):

    working = df.copy()

    # -----------------------------------------------------
    # PRODUCTIVITY
    # -----------------------------------------------------

    working["Prod"] = np.where(
        working["fulltime_employees_normalized"] == 0,
        0,
        (
            working["annual_turnover_normalized"]
            / working["fulltime_employees_normalized"]
        ),
    )

    # -----------------------------------------------------
    # CAPITAL LOCK
    # -----------------------------------------------------

    working["Capital_lock"] = (
        working["inventory_period"] + working["receivables_cycle"]
    ) / 2

    working["Cap_lock_normalized"] = working["Capital_lock"] / 180

    # -----------------------------------------------------
    # COST RIGIDITY
    # -----------------------------------------------------

    working["Cost_rigidity"] = np.where(
        working["annual_turnover_normalized"] == 0,
        0,
        (working["fixed_cost_pct_normalized"] / working["annual_turnover_normalized"]),
    )

    return working


# =========================================================
# Step 4: COMPOSITE FEATURE BUILDING
# =========================================================


def composite_feature_building(df):

    working = df.copy()

    # -----------------------------------------------------
    # WORKING CAPITAL EFFICIENCY
    # -----------------------------------------------------

    working["WC_eff"] = (working["Inv_score"] + working["Rec_score"]) / 2

    # -----------------------------------------------------
    # BEHAVIOURAL READINESS INDEX
    # -----------------------------------------------------

    working["BRI"] = (
        working["inventory_planning_normalized"]
        + working["spend_review_normalized"]
        + working["finances_separate_normalized"]
    ) / 3

    # -----------------------------------------------------
    # STRESS INDEX
    # -----------------------------------------------------

    working["SI"] = (
        working["cash_shortage_1y_normalized"]
        + working["repayment_status_normalized"]
        + working["fixed_cost_pct_normalized"]
    ) / 3

    # -----------------------------------------------------
    # GROWTH PREPAREDNESS INDEX
    # -----------------------------------------------------

    working["GPI"] = (
        working["plans_2y_normalized"]
        + working["pre_invest_plan_normalized"]
        + working["capacity_gap"]
    ) / 3

    return working


# =========================================================
# Step 5: PRIMARY EFFICIENCY SYNTHESIS
# =========================================================


def primary_efficiency_synthesis(df):

    working = df.copy()

    # -----------------------------------------------------
    # CORE EFFICIENCY INDEX (CEI)
    # -----------------------------------------------------

    working["CEI"] = (
        working["Prod"]
        + working["WC_eff"]
        + working["Profit_score"]
        + working["CU_score"]
    ) / 4

    # -----------------------------------------------------
    # RESILIENCE INDEX
    # -----------------------------------------------------

    working["Resilience_Index"] = (
        working["handle_emergency_normalized"]
        + working["survives_sales_drop_normalized"]
        + (1 - working["SI"])
    ) / 3

    # -----------------------------------------------------
    # MANAGEMENT READINESS INDEX
    # -----------------------------------------------------

    working["MRI"] = (
        working["BRI"]
        + working["financial_statements_normalized"]
        + working["tracks_cashflows_normalized"]
    ) / 3

    # -----------------------------------------------------
    # EXPANSION READINESS INDEX
    # -----------------------------------------------------

    working["ERI"] = (
        working["GPI"]
        + working["external_investment_normalized"]
        + working["decision_maker_normalized"]
    ) / 3

    return working


# =========================================================
# Step 6: SECONDARY INDEX GENERATION
# =========================================================


def secondary_index_generation(df):

    working = df.copy()

    # -----------------------------------------------------
    # SUSTAINABILITY INDEX
    # -----------------------------------------------------

    working["Sustainability_Index"] = (
        working["CEI"]
        + working["Resilience_Index"]
        + (1 - working["Cap_lock_normalized"])
    ) / 3

    # -----------------------------------------------------
    # BANKABILITY INDEX
    # -----------------------------------------------------

    working["Bankability_Index"] = (
        working["MRI"] + working["Resilience_Index"] + working["Profit_score"]
    ) / 3

    # -----------------------------------------------------
    # OPERATIONAL STABILITY INDEX
    # -----------------------------------------------------

    working["Operational_Stability_Index"] = (
        working["CU_score"] + (1 - working["Cost_rigidity"]) + working["Prod"]
    ) / 3

    # -----------------------------------------------------
    # SCALABILITY INDEX
    # -----------------------------------------------------

    working["Scalability_Index"] = (
        working["ERI"] + working["MRI"] + working["capacity_gap"]
    ) / 3

    return working


# =========================================================
# Step 7: THRESHOLD CLASSIFICATION LOGIC
# =========================================================


def threshold_classification(df):

    working = df.copy()

    # -----------------------------------------------------
    # CEI CLASSIFICATION
    # -----------------------------------------------------

    working["CEI_Level"] = np.select(
        [
            working["CEI"] >= 0.75,
            (working["CEI"] >= 0.50) & (working["CEI"] < 0.75),
            working["CEI"] < 0.50,
        ],
        ["Efficient-Stable", "Moderate", "High Risk"],
        default="Undefined",
    )

    # -----------------------------------------------------
    # RESILIENCE CLASSIFICATION
    # -----------------------------------------------------

    working["Resilience_Level"] = np.select(
        [
            working["Resilience_Index"] >= 0.75,
            (working["Resilience_Index"] >= 0.50)
            & (working["Resilience_Index"] < 0.75),
            working["Resilience_Index"] < 0.50,
        ],
        ["Strong", "Moderate", "Weak"],
        default="Undefined",
    )

    # -----------------------------------------------------
    # BANKABILITY CLASSIFICATION
    # -----------------------------------------------------

    working["Bankability_Level"] = np.select(
        [
            working["Bankability_Index"] >= 0.75,
            (working["Bankability_Index"] >= 0.50)
            & (working["Bankability_Index"] < 0.75),
            working["Bankability_Index"] < 0.50,
        ],
        ["Bank Ready", "Partially Ready", "Not Bank Ready"],
        default="Undefined",
    )

    # -----------------------------------------------------
    # SCALABILITY CLASSIFICATION
    # -----------------------------------------------------

    working["Scalability_Level"] = np.select(
        [
            working["Scalability_Index"] >= 0.75,
            (working["Scalability_Index"] >= 0.50)
            & (working["Scalability_Index"] < 0.75),
            working["Scalability_Index"] < 0.50,
        ],
        ["Highly Scalable", "Moderately Scalable", "Low Scalability"],
        default="Undefined",
    )

    return working


# =========================================================
# Step 8: INTERPRETATION & ACTION GRID
# =========================================================


def interpretation_action_grid(df):

    working = df.copy()

    # -----------------------------------------------------
    # STRATEGIC ACTION
    # -----------------------------------------------------

    working["Strategic_Action"] = np.select(
        [
            # High efficiency + strong resilience
            ((working["CEI"] >= 0.75) & (working["Resilience_Index"] >= 0.75)),
            # High capital lock
            (working["Cap_lock_normalized"] >= 0.70),
            # Weak profitability
            (working["Profit_score"] < 0.50),
            # Weak management readiness
            (working["MRI"] < 0.50),
            # Weak bankability
            (working["Bankability_Index"] < 0.50),
            # Weak scalability
            (working["Scalability_Index"] < 0.50),
        ],
        [
            "Business Performing Well",
            "Reduce Working Capital Lock",
            "Improve Operational Efficiency",
            "Strengthen Financial Governance",
            "Improve Financial Documentation & Repayment Discipline",
            "Build Structured Growth Plan",
        ],
        default="Monitor Business Performance",
    )

    # -----------------------------------------------------
    # PRIMARY BUSINESS STRENGTH
    # -----------------------------------------------------

    working["Primary_Strength"] = np.select(
        [
            working["CEI"] >= 0.75,
            working["Resilience_Index"] >= 0.75,
            working["Bankability_Index"] >= 0.75,
            working["Scalability_Index"] >= 0.75,
        ],
        [
            "Strong Operational Efficiency",
            "Strong Business Resilience",
            "Strong Financial Credibility",
            "High Expansion Capability",
        ],
        default="Moderate Business Stability",
    )

    # -----------------------------------------------------
    # PRIMARY BUSINESS RISK
    # -----------------------------------------------------

    working["Primary_Risk"] = np.select(
        [
            working["SI"] >= 0.70,
            working["Cap_lock_normalized"] >= 0.70,
            working["Cost_rigidity"] >= 0.70,
            working["MRI"] < 0.50,
        ],
        [
            "High Financial Stress",
            "Excess Working Capital Lock",
            "High Cost Rigidity",
            "Weak Financial Governance",
        ],
        default="No Major Risk Detected",
    )

    return working


# =========================================================
# FINAL DASHBOARD OUTPUT
# =========================================================

from datetime import datetime


def get_risk_zone(value, threshold, reverse=False):

    if reverse:

        if value < threshold:
            return "safe"
        elif value < threshold + 0.15:
            return "warning"
        else:
            return "breach"

    else:

        if value >= threshold:
            return "safe"
        elif value >= threshold - 0.15:
            return "warning"
        else:
            return "breach"


def build_dashboard_output(df):

    row = df.iloc[0]

    dashboard = {
        "generated_at": datetime.utcnow().isoformat(),
        "business_summary": {
            "classification": row["CEI_Level"],
            "primary_strength": row["Primary_Strength"],
            "primary_risk": row["Primary_Risk"],
            "overall_risk_zone": "safe" if row["CEI"] >= 0.75 else "warning",
        },
        "metrics": [
            {
                "metric_code": "CEI",
                "metric_name": "Capital Efficiency Index",
                "value": round(row["CEI"], 4),
                "risk_cliff": 0.87,
                "risk_zone": get_risk_zone(row["CEI"], 0.75),
                "interpretation": "Business operations are efficient with stable cash utilization and productive operational performance.",
                "strategic_action": "Maintain operational discipline while scaling gradually.",
            },
            {
                "metric_code": "MRI",
                "metric_name": "Management Readiness Index",
                "value": round(row["MRI"], 4),
                "risk_cliff": 0.55,
                "risk_zone": get_risk_zone(row["MRI"], 0.50),
                "interpretation": (
                    "Management systems and governance practices indicate moderate operational control."
                    if row["MRI"] >= 0.50
                    else "Weak governance structure and poor financial management discipline may affect sustainability."
                ),
                "strategic_action": (
                    "Strengthen governance controls and improve financial monitoring systems."
                    if row["MRI"] < 0.50
                    else "Maintain disciplined management and operational monitoring."
                ),
            },
            {
                "metric_code": "SI",
                "metric_name": "Stress Index",
                "value": round(row["SI"], 4),
                "risk_cliff": 0.60,
                "risk_zone": get_risk_zone(row["SI"], 0.60, reverse=True),
                "interpretation": (
                    "Financial stress exposure remains within manageable levels."
                    if row["SI"] < 0.60
                    else "Business is showing elevated financial stress and repayment pressure."
                ),
                "strategic_action": (
                    "Maintain liquidity discipline and monitor expenses carefully."
                    if row["SI"] < 0.60
                    else "Reduce financial pressure by restructuring expenses and improving cash flow."
                ),
            },
            {
                "metric_code": "CLI",
                "metric_name": "Capital Lock Index",
                "value": round(row["Cap_lock_normalized"], 4),
                "risk_cliff": 0.54,
                "risk_zone": get_risk_zone(
                    row["Cap_lock_normalized"], 0.54, reverse=True
                ),
                "interpretation": (
                    "Working capital movement is healthy with manageable inventory and receivable cycles."
                    if row["Cap_lock_normalized"] < 0.54
                    else "Excess capital is locked in inventory or delayed receivables."
                ),
                "strategic_action": (
                    "Improve receivable collection efficiency and optimize inventory cycles."
                    if row["Cap_lock_normalized"] >= 0.54
                    else "Maintain current working capital discipline."
                ),
            },
            {
                "metric_code": "CRI",
                "metric_name": "Credit Readiness Index",
                "value": round(row["Bankability_Index"], 4),
                "risk_cliff": 0.38,
                "risk_zone": get_risk_zone(row["Bankability_Index"], 0.38),
                "interpretation": (
                    "Business demonstrates acceptable financial credibility for formal credit access."
                    if row["Bankability_Index"] >= 0.38
                    else "Low financial readiness may reduce access to institutional credit."
                ),
                "strategic_action": (
                    "Strengthen documentation quality and repayment discipline."
                    if row["Bankability_Index"] < 0.38
                    else "Explore formal lending opportunities for structured expansion."
                ),
            },
            {
                "metric_code": "SAC",
                "metric_name": "Sustainability Assurance Coefficient",
                "value": round(row["Sustainability_Index"], 4),
                "risk_cliff": 0.52,
                "risk_zone": get_risk_zone(row["Sustainability_Index"], 0.52),
                "interpretation": (
                    "Financial reserves and sustainability conditions are stable."
                    if row["Sustainability_Index"] >= 0.52
                    else "Long-term sustainability buffer appears weak under current operating conditions."
                ),
                "strategic_action": (
                    "Build stronger reserves and improve financial sustainability planning."
                    if row["Sustainability_Index"] < 0.52
                    else "Maintain sustainable financial practices and reserve discipline."
                ),
            },
            {
                "metric_code": "CTI",
                "metric_name": "Controlled Growth Index",
                "value": round(row["Scalability_Index"], 4),
                "risk_cliff": 0.86,
                "risk_zone": get_risk_zone(row["Scalability_Index"], 0.50),
                "interpretation": (
                    "Business growth readiness is currently limited by operational scalability constraints."
                    if row["Scalability_Index"] < 0.50
                    else "Business demonstrates healthy scalability and structured expansion readiness."
                ),
                "strategic_action": (
                    "Delay aggressive expansion until scalability and operational readiness improve."
                    if row["Scalability_Index"] < 0.50
                    else "Proceed with phased and strategically planned expansion."
                ),
            },
        ],
    }

    return dashboard


# =========================================================
# COMPLETE PIPELINE
# =========================================================


def generate_risk_report(company_df):

    working = structural_normalization(company_df)

    working = simple_normalization(working)

    working = repayment_normalization(working)

    working = calculate_capacity_gap(working)

    working = sigmoid_features(working)

    working = internal_efficiency_ratios(working)

    working = composite_feature_building(working)

    working = primary_efficiency_synthesis(working)

    working = secondary_index_generation(working)

    working = threshold_classification(working)

    working = interpretation_action_grid(working)

    return build_dashboard_output(working)
