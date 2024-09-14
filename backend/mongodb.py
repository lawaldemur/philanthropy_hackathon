from pymongo import MongoClient
import os
from dotenv import load_dotenv


load_dotenv()
def connect_to_mongodb():
    # Connection string
    mongo_uri = os.getenv("DATABASE_URL")
    
    try:
        client = MongoClient(mongo_uri)
        
        db = client.get_database('volunteer_match')
        
        return "Connected to MongoDB successfully!"
    
    except Exception as e:
        print(f"An error occurred while connecting to MongoDB: {e}")
        return None

