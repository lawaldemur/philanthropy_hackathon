from flask import (
    Flask,
    request,
    send_from_directory,
    session,
    url_for,
    redirect,
    jsonify,
)
import os
from pymongo import MongoClient

app = Flask(__name__, static_folder="./react-app/build", static_url_path="")

# Redirects to built react app
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def main(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


@app.route('/about')
def about():
    return "This is the about page!"


@app.route('/db')
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



if __name__ == '__main__':
    app.run(debug=True)
