# crud.py
from sqlalchemy.orm import Session
import models, schema
import pandas as pd
from typing import List
from sqlalchemy import asc, desc


def get_unpredicted_data(db: Session, limit: int = 100):
    """Fetches rows that haven't been processed yet."""
    return db.query(models.PredictionData).filter(
        models.PredictionData.projected_cholera == None
    ).limit(limit).all()

def update_data_predictions(db: Session, data_id: int, cholera: int, typhoid: int):
    """Updates a specific row with new prediction data."""
    db_data = db.query(models.PredictionData).filter(models.PredictionData.id == data_id).first()
    if db_data:
        db_data.projected_cholera = cholera
        db_data.projected_typhoid = typhoid
        db.commit()
        db.refresh(db_data)
    return db_data

def bulk_insert_data_from_dataframe(db: Session, df: pd.DataFrame):
    """Converts a DataFrame into records and inserts them into the DB."""
    # Convert DataFrame to a list of dictionaries
    data_dicts = df.to_dict(orient="records")
    
    # Validate with Pydantic and create model instances
    db_items = [models.PredictionData(**schema.PredictionInput(**row).dict()) for row in data_dicts]
    
    db.add_all(db_items)
    db.commit()
    return len(db_items)


def get_all_processed_data_with_range(db: Session):
    """
    Fetches all processed data and calculates the earliest and latest
    year/month.
    """
    # Create the base query for processed data
    query = db.query(models.PredictionData).filter(
        models.PredictionData.projected_cholera != None,
        models.PredictionData.projected_typhoid != None
    )
    
    # 1. Get all the data
    all_data = query.all()
    
    if not all_data:
        return None, None
    
    # 2. Find the date range from the processed data
    
    # Find earliest
    earliest_row = query.order_by(
        models.PredictionData.Year.asc(), 
        models.PredictionData.Month.asc()
    ).first()
    
    # Find latest
    latest_row = query.order_by(
        models.PredictionData.Year.desc(), 
        models.PredictionData.Month.desc()
    ).first()

    date_range = {
        "start_year": earliest_row.Year,
        "start_month": earliest_row.Month,
        "end_year": latest_row.Year,
        "end_month": latest_row.Month,
    }

    return all_data, date_range