import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer




from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()


# Add CORS Middleware
origins = [
    "http://localhost",
    "http://localhost:8000",
    "https://prae-vita-frontend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    Region: str
    City: str
    Year : int
    Month: int
    Rainfall_mm: float
    Temperature_celsius: float
    Sanitation_Index: float
    Water_Quality_Index: float
    Population_Density: float
    Waste_Management_Score: float
    Cholera_Cases: int
    Typhoid_Cases: int

MODEL_PATH = 'model/cholera_xgb_pipeline.pkl'
model = None

try:
    # Make sure imports above are done BEFORE this line
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print(f"ERROR: Model file not found at {MODEL_PATH}")
except Exception as e:
    print(f"ERROR: Failed to load model. {e}")
    model = None


@app.get("/")
def read_root():
    return {"message": "Welcome to the Disease Outbreak Prediction API"}

@app.post("/predict")
def predict_disease_outbreak(input_data: PredictionInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded properly.")
    
    # Convert input data to DataFrame
    input_dict = input_data.dict()
    input_df = pd.DataFrame([input_dict])
    
    # Make prediction
    prediction = model.predict(input_df)
    
    # Return the prediction result
    return {"prediction": [int(prediction[0][0]), int(prediction[0][1])]}