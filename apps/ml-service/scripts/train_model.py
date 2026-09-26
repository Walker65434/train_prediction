import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor
import joblib

os.makedirs("app/artifacts", exist_ok=True)

print("1. Loading dataset...")
df = pd.read_csv("data/ir_train.csv", nrows=100000)

print("2. Preprocessing...")
df = df.dropna(subset=["delay_minutes"])

y = df["delay_minutes"]

columns_to_remove = [
    "journey_id",
    "departure_date",
    "primary_delay_cause",
    "delay_minutes",
    "is_delayed",
    "is_overloaded",
]

X = df.drop(columns=[col for col in columns_to_remove if col in df.columns])

categorical_features = X.select_dtypes(include=["object", "category"]).columns.tolist()
numerical_features = X.select_dtypes(include=["int64", "float64"]).columns.tolist()

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            categorical_features,
        ),
        ("numerical", "passthrough", numerical_features),
    ]
)

print("3. Fitting preprocessor...")
X_encoded = preprocessor.fit_transform(X)

print("4. Training XGBoost model...")
xgb_model = XGBRegressor(
    n_estimators=300,
    max_depth=8,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=5,
    objective="reg:squarederror",
    eval_metric="rmse",
    random_state=42,
    n_jobs=-1,
)

xgb_model.fit(X_encoded, y)

print("5. Saving artifacts...")
joblib.dump(preprocessor, "app/artifacts/preprocessor.pkl")
xgb_model.save_model("app/artifacts/xgboost_model.json")

print("Training completed successfully!")
