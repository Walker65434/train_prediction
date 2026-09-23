import pandas as pd
import numpy as np

# =========================================================
# Step 1: Preprocessing
# =========================================================

benchmark_df = pd.read_csv("app/artifacts/csv/public_data.csv")


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
# 1: STRUCTURAL NORMALIZATION
# =========================================================


def structural_normalization(company_df):

    working = company_df.merge(
        benchmark_df, left_on="business_type", right_on="Industry", how="left"
    )

    # CAPITAL INTENSITY SCORE
    working["CI_score"] = working["Sector_Median_CI"] / (
        working["total_assets_value"] / working["annual_turnover"]
    )

    # CAPACITY UTILIZATION SCORE
    working["CU_score"] = (working["capacity_used_pct"] / 100) / working[
        "Sector_Capacity_Util"
    ]

    # PROFITABILITY SCORE
    working["Profit_score"] = (
        working["annual_profit"] / working["annual_turnover"]
    ) / working["Sector_Median_Margin (EBITDA)"]

    # INVENTORY SCORE
    working["Inv_score"] = np.where(
        working["inventory_period"] == 0,
        0,
        (working["Sector_Inv_Days"] / working["inventory_period"]),
    )

    # RECEIVABLE SCORE
    working["Rec_score"] = np.where(
        working["receivables_cycle"] == 0,
        0,
        (working["Sector_Rec_Days"] / working["receivables_cycle"]),
    )

    return working


# =========================================================
# 2: SIMPLE NORMALIZATION
# =========================================================


def simple_normalization(df):

    working = df.copy()

    # ORDINAL SCALE FEATURES (1–5)
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

    # BINARY FEATURES (0/1)

    working["cash_shortage_1y_normalized"] = working["cash_shortage_1y"] / ordinal_max

    return working


# =========================================================
# 3: REPAYMENT STATUS NORMALIZATION
# =========================================================


def repayment_normalization(df):

    working = df.copy()

    # Avoid division by zero or invalid max values
    max_repayment_value = max(working["repayment_status"].max(), 1)

    working["repayment_status_normalized"] = np.where(
        working["repayment_status"] == -1,
        0,
        (working["repayment_status"] / max_repayment_value),
    )

    return working


# =========================================================
# 4: CALCULATE CAPACITY GAP
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
# 5: SIGMOID FEATURES
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
