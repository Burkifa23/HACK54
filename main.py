import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
import io

from sqlalchemy.orm import Session
import crud, models, schema, database
from database import SessionLocal, engine

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Literal
from fastapi.middleware.cors import CORSMiddleware
import instructor
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import google.generativeai as genai



# --- ADDED: Create DB tables on startup ---
models.Base.metadata.create_all(bind=engine)

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
    "http://localhost:3000",
    "https://prae-vita-frontend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ADDED: Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# --- END ADDED ---


from schema import (
    PredictionInput, SinglePrediction, PredictedCases, 
    Location, ReportOutput, PredictionData
)

MODEL_PATH = 'model/cholera_gb_pipeline.joblib'
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



# --- NEW: Background Task for Processing ---
def process_pending_predictions():
    """
    This function runs in the background.
    It gets its own DB session, finds unprocessed rows,
    predicts them, and updates the DB.
    """
    print("Background processing started...")
    if model is None:
        print("Model is not loaded. Cannot process background tasks.")
        return
    db = SessionLocal()
    try:
        # Get rows where projected_cholera is NULL
        unpredicted_rows = crud.get_unpredicted_data(db=db)
        if not unpredicted_rows:
            print("No new data to predict.")
            return

        print(f"Found {len(unpredicted_rows)} rows to process.")
        
        for row in unpredicted_rows:
            # Convert the SQLAlchemy model row back to a dict, then to a DataFrame
            # so the scikit-learn pipeline can understand it.
            input_dict = {
                "Region": row.Region,
                "City": row.City,
                "Year": row.Year,
                "Month": row.Month,
                "Rainfall_mm": row.Rainfall_mm,
                "Temperature_celsius": row.Temperature_celsius,
                "Sanitation_Index": row.Sanitation_Index,
                "Water_Quality_Index": row.Water_Quality_Index,
                "Population_Density": row.Population_Density,
                "Waste_Management_Score": row.Waste_Management_Score,
                "Cholera_Cases": row.Cholera_Cases,
                "Typhoid_Cases": row.Typhoid_Cases,
            }
            input_df = pd.DataFrame([input_dict])
            
            # Make the prediction
            prediction = model.predict(input_df)
            proj_cholera = int(prediction[0][0])
            proj_typhoid = int(prediction[0][1])
            
            # Update the row in the database
            crud.update_data_predictions(
                db=db, 
                data_id=row.id, 
                cholera=proj_cholera, 
                typhoid=proj_typhoid
            )
        
        print(f"Successfully processed {len(unpredicted_rows)} rows.")

    except Exception as e:
        print(f"Error in background processing: {e}")
    finally:
        db.close()




@app.post("/upload-data/")
async def upload_data_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    This endpoint accepts a CSV or Excel file, stores its contents
    in the database, and triggers a background task to run predictions.
    """
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .csv or .xlsx file.")

    try:
        # Read the file into a pandas DataFrame
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        # Optional: Add column validation here
        expected_cols = set(PredictionInput.__annotations__.keys())
        if not expected_cols.issubset(df.columns):
            missing = expected_cols - set(df.columns)
            raise HTTPException(
                status_code=400, 
                detail=f"File is missing required columns: {missing}"
            )

        # Insert all data into the database
        rows_added = crud.bulk_insert_data_from_dataframe(db=db, df=df)
        
        # Add the prediction task to the background
        background_tasks.add_task(process_pending_predictions)

        return {
            "message": f"Successfully uploaded {file.filename}",
            "rows_added": rows_added,
            "detail": "Prediction processing has started in the background."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
# --- END NEW ---



@app.get("/get-all-predictions/", response_model=List[PredictionData])
def get_all_predictions(db: Session = Depends(get_db)):
    """
    Retrieves all records from the database, including predictions.
    """
    data = db.query(models.PredictionData).all()
    return data



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


@app.post("/generate-comprehensive-report", response_model=ReportOutput)
async def create_comprehensive_report(
    db: Session = Depends(get_db)
) -> ReportOutput:
    """
    This endpoint fetches ALL processed data from the entire database,
    and returns a full, AI-generated comprehensive summary.
    """
    
    # --- Step 1: Fetch all processed data and the date range ---
    processed_data, date_range = crud.get_all_processed_data_with_range(db=db)
    
    if not processed_data:
        raise HTTPException(
            status_code=404, 
            detail="No processed prediction data found in the database."
        )

    # --- Step 2: Prepare prompt variables ---
    now_utc = datetime.now(timezone.utc)
    
    # Create a dynamic reporting_period string
    try:
        start_month_name = datetime(date_range["start_year"], date_range["start_month"], 1).strftime('%B')
        end_month_name = datetime(date_range["end_year"], date_range["end_month"], 1).strftime('%B')
        
        if (date_range["start_year"] == date_range["end_year"] and 
            date_range["start_month"] == date_range["end_month"]):
            reporting_period = f"{start_month_name} {date_range['start_year']}"
        else:
            reporting_period = f"{start_month_name} {date_range['start_year']} to {end_month_name} {date_range['end_year']}"
            
    except Exception:
        reporting_period = "All Available Data" # Fallback

    # --- Step 3: Create the System Prompt (Modified) ---
    system_prompt = f"""
    You are an expert Public Health Analyst for the Ghana Health Service,
    tasked with writing a *comprehensive executive summary* for the Ministry.
    
    Your job is to take a list of raw data from multiple districts *and*
    *multiple time periods* and generate a complete, structured report
    according to the 'ReportOutput' schema.

    You must perform the following actions:
    1.  **POPULATE 'regional_data' LIST**: For *each* data entry in the
        provided data, you must create a 'RegionalData' object.
        -   The 'location' object must include the specific region and district.
        -   You must calculate 'projected_change_percent' and 'risk_level'.
        -   Write a 1-2 sentence 'key_factors_summary' highlighting the
            main drivers for that specific district *at that specific time*.
    
    2.  **RISK LEVEL RULES**:
        -   > 50% increase = "Severe"
        -   20-50% increase = "Medium"
        -   < 20% increase = "Low"
    
    3.  **CALCULATION RULES**:
        -   change = ((new - old) / old) * 100
        -   If old is 0, a 'new' > 0 is a 100% increase.
        
    4.  **WRITE SUMMARIES (CRITICAL)**: After analyzing all data, write:
        -   'description': An executive summary (3-4 sentences) for the
            *entire reporting period* ({reporting_period}), identifying
            overall trends, seasonal patterns, and persistent high-risk zones.
        -   'call_to_action': A prioritized list (2-3 items) of *strategic,
            long-term actions* for the *regional* directorate based on the
            total data.

    You must return a valid JSON object matching the 'ReportOutput' structure.
    """

    # --- Step 4: Create the User Prompt (Data Dump) ---
    # We must include the Year/Month for each entry so the AI can see trends
    data_dump = ""
    for row in processed_data:
        data_dump += (
            f"\n--- District Data Entry (Period: {row.Month}/{row.Year}) ---\n"
            f"Region: {row.Region}\n"
            f"District: {row.City}\n"
            f"Current Cases (Cholera/Typhoid): {row.Cholera_Cases} / {row.Typhoid_Cases}\n"
            f"Projected Cases (Cholera/Typhoid): {row.projected_cholera} / {row.projected_typhoid}\n"
            f"Key Factors:\n"
            f"  - Rainfall: {row.Rainfall_mm} mm\n"
            f"  - Sanitation Index (0-1): {row.Sanitation_Index}\n"
      f"  - Water Quality Index (0-1): {row.Water_Quality_Index}\n"
            f"  - Population Density: {row.Population_Density} per km²\n"
            f"  - Waste Management Score (0-1): {row.Waste_Management_Score}\n"
        )

    user_prompt = f"""
    Please generate a full, comprehensive public health report based on the
    following data entries for the entire reporting period: {reporting_period}.

    Report Generation Date: {now_utc.isoformat()}
    
    {data_dump}
    """

    # --- Step 5: Call the AI (Unchanged) ---
    try:
        report = client.create(
            response_model=ReportOutput,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_retries=2,
        )
        
        return report
        
    except Exception as e:
        print(f"AI Error: {e}") 
        raise HTTPException(
            status_code=500, 
            detail=f"AI report generation failed: {str(e)}"
        )