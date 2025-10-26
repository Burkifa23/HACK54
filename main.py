import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer




from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal
from fastapi.middleware.cors import CORSMiddleware
import instructor
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import google.generativeai as genai


load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in .env file")

app = FastAPI()

# Configure the Google client
genai.configure(api_key=GOOGLE_API_KEY)

client = instructor.from_provider(
    "google/gemini-2.5-flash",
    mode=instructor.Mode.GEMINI_JSON,
)
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
# Data Model
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

class SinglePrediction(BaseModel):
    projected_cases: int
    projected_change_percent: float = Field(..., 
        description="The percentage change from current cases")
    risk_level: Literal["Low", "Medium", "High", "Severe"]

class PredictedCases(BaseModel):
    cholera: SinglePrediction = Field(..., 
        description="The forecast and risk assessment for Cholera")
    typhoid: SinglePrediction = Field(..., 
        description="The forecast and risk assessment for Typhoid")

class Location(BaseModel):
    region: str
    district: str

class ReportOutput(BaseModel):
    """A structured public health report for the Ministry of Health."""
    title: str = Field(default="Projected Public Health Risk Report")
    subtitle: str = Field(default="Cholera and Typhoid Outbreak Projections")
    date_generated: str
    reporting_period: str = Field(..., description="The human-readable period, e.g., 'November 2025'")
    location: Location
    predicted_cases: List[PredictedCases]
    description: str = Field(
        ..., 
        description="An essay (3-4 sentences) summarizing the key findings, projections, and primary risk factors."
    )
    call_to_action: str = Field(
        ..., 
        description="An essay (2-3 sentences) detailing the top 2-3 recommended actions for the health directorate."
    )

class ReportRequest(BaseModel):
    """
    This is the data our new endpoint will receive.
    It combines the original inputs with the new predictions.
    """
    prediction_input: PredictionInput
    projected_cholera: int
    projected_typhoid: int

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


@app.post("/generate-report", response_model=ReportOutput)
async def create_report(request: ReportRequest) -> ReportOutput:
    """
    This endpoint takes model inputs and predictions,
    and returns a full, AI-generated structured report using Gemini.
    """
    inp = request.prediction_input

    def calc_change(new, old):
        if old == 0:
            return 100.0 if new > 0 else 0.0
        return round(((new - old) / old) * 100, 1)
    
    cholera_change = calc_change(request.projected_cholera, inp.Cholera_Cases)
    typhoid_change = calc_change(request.projected_typhoid, inp.Typhoid_Cases)

    now_utc = datetime.now(timezone.utc)
    month_name = datetime(inp.Year, inp.Month, 1).strftime('%B')
    reporting_period = f"{month_name} {inp.Year}"

    system_prompt = """
    You are an expert public health analyst for the Ghana Health Service. 
    Your job is to take raw data from a disease prediction model and write a 
    formal, structured report for a government health ministry. 
    
    Analyze the provided data to generate the 'description' and 'call_to_action'.
    - The 'description' must summarize the main risk and identify the
      key contributing factors (e.g., "heavy rainfall," "poor sanitation index").
    - The 'call_to_action' must be clear, actionable, and prioritized for a 
      Ghanaian district directorate.
    
    You must calculate the risk_level for each disease based on the projected_change_percent.
    - > 50% increase = "High" or "Severe"
    - 20-50% increase = "Medium"
    - < 20% increase = "Low"
    
    You must return a valid JSON object matching the requested structure.
    """

    # The user prompt contains the raw data
    user_prompt = f"""
    Please generate a public health report based on the following data:
    
    --- Location & Period ---
    Region: {inp.Region}
    City/District: {inp.City}
    Year: {inp.Year}
    Month: {inp.Month} (Reporting Period: {reporting_period})
    
    --- Current vs. Projected Cases ---
    Cholera: {inp.Cholera_Cases} (current) -> {request.projected_cholera} (projected) / {cholera_change}% change
    Typhoid: {inp.Typhoid_Cases} (current) -> {request.projected_typhoid} (projected) / {typhoid_change}% change
    
    --- Key Environmental & Social Factors ---
    Rainfall: {inp.Rainfall_mm} mm
    Temperature: {inp.Temperature_celsius} °C
    Sanitation Index (0-1): {inp.Sanitation_Index}
    Water Quality Index (0-1): {inp.Water_Quality_Index}
    Population Density: {inp.Population_Density} per km²
    Waste Management Score (0-1): {inp.Waste_Management_Score}
    
    --- Report Generation Info ---
    Date to put on report: {now_utc.isoformat()}
    """

    try:
        report =  client.create(
            response_model=ReportOutput, # This is the instructor magic!
            messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ],
        )
        
        # The `report` variable is now a fully validated ReportOutput Pydantic model
        return report
        
    except Exception as e:
        # Handle cases where the AI fails to generate a valid report
        print(f"AI Error: {e}") # Log the error for debugging
        raise HTTPException(
            status_code=500, 
            detail=f"AI report generation failed: {str(e)}"
        )

@app.get("/check")
def read_root():
    return {"message": "Health Report API is running."}