import numpy as np

# =========================================================
# Step 2: FEATURE ENGINEERING
# =========================================================


# =========================================================
# 1: INTERNAL EFFICIENCY RATIOS
# =========================================================


def internal_efficiency_ratios(df):

    working = df.copy()

    # PRODUCTIVITY
    working["Prod"] = np.where(
        working["fulltime_employees_normalized"] == 0,
        0,
        (
            working["annual_turnover_normalized"]
            / working["fulltime_employees_normalized"]
        ),
    )

    # CAPITAL LOCK
    working["Capital_lock"] = (
        working["inventory_period"] + working["receivables_cycle"]
    ) / 2

    working["Cap_lock_normalized"] = working["Capital_lock"] / 180

    # COST RIGIDITY
    working["Cost_rigidity"] = np.where(
        working["annual_turnover_normalized"] == 0,
        0,
        (working["fixed_cost_pct_normalized"] / working["annual_turnover_normalized"]),
    )

    return working


# =========================================================
# 2: COMPOSITE FEATURE BUILDING
# =========================================================


def composite_feature_building(df):

    working = df.copy()

    # WORKING CAPITAL EFFICIENCY
    working["WC_eff"] = (working["Inv_score"] + working["Rec_score"]) / 2

    # BEHAVIOURAL READINESS INDEX
    working["BRI"] = (
        working["inventory_planning_normalized"]
        + working["spend_review_normalized"]
        + working["finances_separate_normalized"]
    ) / 3

    # STRESS INDEX
    working["SI"] = (
        working["cash_shortage_1y_normalized"]
        + working["repayment_status_normalized"]
        + working["fixed_cost_pct_normalized"]
    ) / 3

    # GROWTH PREPAREDNESS INDEX
    working["GPI"] = (
        working["plans_2y_normalized"]
        + working["pre_invest_plan_normalized"]
        + working["capacity_gap"]
    ) / 3

    return working
