# schemas.py
from pydantic import BaseModel, Field
from typing import List, Literal, Optional

# This is your original PredictionInput model
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

# This model is used when reading data from the DB
class PredictionData(PredictionInput):
    id: int
    projected_cholera: Optional[int]
    projected_typhoid: Optional[int]

    class Config:
        orm_mode = True # Renamed to from_attributes in Pydantic v2

# --- Keep all your other Pydantic models here too ---
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

class RegionalData(BaseModel):
    location: Location
    predictions: PredictedCases
    key_factors_summary: str = Field(..., 
        description="A 1-2 sentence summary of the primary risk drivers for this specific district.")

# ReportOutput is now an "Executive Summary" for the whole region
class ReportOutput(BaseModel):
    """A structured public health executive summary for the Ministry of Health."""
    title: str = Field(default="Regional Public Health Risk Report")
    subtitle: str = Field(default="Cholera and Typhoid Outbreak Projections")
    date_generated: str
    reporting_period: str = Field(..., description="The human-readable period, e.g., 'November 2025'")
    
    # This replaces the old 'location' and 'predicted_cases' fields
    regional_data: List[RegionalData] = Field(..., 
        description="A list of prediction summaries, one for each district.")
    
    description: str = Field(
        ..., 
        description="An executive summary (3-4 sentences) for the *entire* report, highlighting key trends and highest-risk areas."
    )
    call_to_action: str = Field(
        ..., 
        description="A prioritized list (2-3 items) of recommended actions for the *regional* health directorate."
    )
