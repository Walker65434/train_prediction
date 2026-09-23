# =========================================================
# Step 3: INDEX GENERATION
# =========================================================


# =========================================================
# 1: PRIMARY EFFICIENCY SYNTHESIS
# =========================================================


def primary_efficiency_synthesis(df):

    working = df.copy()

    # CORE EFFICIENCY INDEX (CEI)
    working["CEI"] = (
        working["Prod"]
        + working["WC_eff"]
        + working["Profit_score"]
        + working["CU_score"]
    ) / 4

    # RESILIENCE INDEX
    working["Resilience_Index"] = (
        working["handle_emergency_normalized"]
        + working["survives_sales_drop_normalized"]
        + (1 - working["SI"])
    ) / 3

    # MANAGEMENT READINESS INDEX
    working["MRI"] = (
        working["BRI"]
        + working["financial_statements_normalized"]
        + working["tracks_cashflows_normalized"]
    ) / 3

    # EXPANSION READINESS INDEX
    working["ERI"] = (
        working["GPI"]
        + working["external_investment_normalized"]
        + working["decision_maker_normalized"]
    ) / 3

    return working


# =========================================================
# 2: SECONDARY INDEX GENERATION
# =========================================================


def secondary_index_generation(df):

    working = df.copy()

    # SUSTAINABILITY INDEX
    working["Sustainability_Index"] = (
        working["CEI"]
        + working["Resilience_Index"]
        + (1 - working["Cap_lock_normalized"])
    ) / 3

    # BANKABILITY INDEX
    working["Bankability_Index"] = (
        working["MRI"] + working["Resilience_Index"] + working["Profit_score"]
    ) / 3

    # OPERATIONAL STABILITY INDEX
    working["Operational_Stability_Index"] = (
        working["CU_score"] + (1 - working["Cost_rigidity"]) + working["Prod"]
    ) / 3

    # SCALABILITY INDEX
    working["Scalability_Index"] = (
        working["ERI"] + working["MRI"] + working["capacity_gap"]
    ) / 3

    return working
