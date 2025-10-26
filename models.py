# models.py
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class PredictionData(Base):
    __tablename__ = "prediction_data"

    id = Column(Integer, primary_key=True, index=True)
    
    # Fields from your input file
    Region = Column(String, index=True)
    City = Column(String, index=True)
    Year = Column(Integer)
    Month = Column(Integer)
    Rainfall_mm = Column(Float)
    Temperature_celsius = Column(Float)
    Sanitation_Index = Column(Float)
    Water_Quality_Index = Column(Float)
    Population_Density = Column(Float)
    Waste_Management_Score = Column(Float)
    Cholera_Cases = Column(Integer)
    Typhoid_Cases = Column(Integer)
    
    # New fields to store the prediction results
    projected_cholera = Column(Integer, nullable=True)
    projected_typhoid = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())