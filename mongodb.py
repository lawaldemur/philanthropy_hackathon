from pymongo import MongoClient


def connect_to_mongodb():
    # Connection string
    mongo_uri = "mongodb+srv://volunteer_match:volunteer_match@cluster0.lqx4a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    
    try:
        client = MongoClient(mongo_uri)
        
        db = client.get_database('volunteer_match')
        
        return "Connected to MongoDB successfully!"
    
    except Exception as e:
        print(f"An error occurred while connecting to MongoDB: {e}")
        return None

