# =========================================================
# Steps — Main file of pipeline
# =========================================================


from app.pipelines.preprocessing import (
    structural_normalization,
    simple_normalization,
    repayment_normalization,
    calculate_capacity_gap,
    sigmoid_features,
)

from app.pipelines.feature_engineering import (
    internal_efficiency_ratios,
    composite_feature_building,
)

from app.pipelines.index_generation import (
    primary_efficiency_synthesis,
    secondary_index_generation,
)

from app.pipelines.rf_engine import run_rf_pipeline
from app.pipelines.threshold_engine import threshold_classification
from app.pipelines.build_dashbaord import build_dashboard_output
from app.pipelines.interpretation_engine import interpretation_action_grid
from app.pipelines.cluster_engine import generate_behavioral_intelligence
from app.pipelines.shap_engine import generate_shap_explanations


def predict_pipeline(df):

    working = df.copy()

    # =====================================================
    # STEP 1 — PREPROCESSING
    # =====================================================

    working = structural_normalization(working)
    working = simple_normalization(working)
    working = repayment_normalization(working)
    working = calculate_capacity_gap(working)
    working = sigmoid_features(working)

    # =====================================================
    # STEP 2 — FEATURE ENGINEERING
    # =====================================================

    working = internal_efficiency_ratios(working)
    working = composite_feature_building(working)

    # =====================================================
    # STEP 3 — INDEX GENERATION
    # =====================================================

    working = primary_efficiency_synthesis(working)
    working = secondary_index_generation(working)

    # =====================================================
    # STEP 4 — RANDOM FOREST PREDICTIONS
    # =====================================================

    working = run_rf_pipeline(working)
    working = threshold_classification(working)
    working = interpretation_action_grid(working)
    working = generate_behavioral_intelligence(working)
    working = generate_shap_explanations(working)

    # =====================================================
    # STEP 5 — FINAL OUTPUT
    # =====================================================

    dashboard = build_dashboard_output(working)
    return dashboard
