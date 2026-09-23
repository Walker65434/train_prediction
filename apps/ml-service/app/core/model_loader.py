import os
import joblib

class ModelLoader:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.feature_names = None
        self.artifacts_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            "artifacts"
        )

    def load(self):
        try:
            model_path = os.path.join(self.artifacts_dir, "xgb_full_model.pkl")
            preprocessor_path = os.path.join(self.artifacts_dir, "preprocessor.pkl")
            feature_names_path = os.path.join(self.artifacts_dir, "feature_names.pkl")

            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            if not os.path.exists(preprocessor_path):
                raise FileNotFoundError(f"Preprocessor not found: {preprocessor_path}")
            if not os.path.exists(feature_names_path):
                raise FileNotFoundError(f"Feature names not found: {feature_names_path}")

            print("Loading models from reference directory...", flush=True)
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(preprocessor_path)
            self.feature_names = joblib.load(feature_names_path)
            
            print("Models and preprocessor loaded successfully!", flush=True)
            
        except Exception as e:
            print(f"Error loading models: {e}", flush=True)
            raise e

model_loader = ModelLoader()
