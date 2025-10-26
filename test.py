# test_db.py
from database import engine, Base

# You MUST import models here, even if you don't use it directly.
# Importing it tells SQLAlchemy's 'Base' about the tables you defined.
import models 

print("Attempting to create database tables...")

try:
    # This one line tells the engine to create all tables 
    # (like 'prediction_data' from models.py) in the DB file.
    Base.metadata.create_all(bind=engine)

    print("Success!")
    print("Check your folder for a new file named 'predictions.db'")
except Exception as e:
    print(f"An error occurred: {e}")