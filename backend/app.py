# app.py
from flask import Flask, request, send_from_directory, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from pymongo import MongoClient
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="../react-app/build", static_url_path="")
CORS(app)  # Consider configuring CORS more securely in production
app.secret_key = os.urandom(24).hex()
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default_secret_key')  # Use a default for development
jwt = JWTManager(app)

# Configure MongoDB
client = MongoClient(os.getenv("DATABASE_URL"))
db = client.get_database('volunteer_match')

# Public Routes
@app.route("/status")
def status():
    return {"status": "running 💡"}, 200

@app.route("/get_posts", methods=["GET"])
def get_posts():
    posts = list(db.posts.find())
    for post in posts:
        post["_id"] = str(post["_id"])
        post["category_id"] = str(post["category_id"])
        author_data = get_user(post.get("author_id"))
        if author_data:
            post["author_first_name"] = author_data.get("first_name", "")
            post["author_last_name"] = author_data.get("last_name", "")
    return jsonify(posts), 200

@app.route("/get_categories", methods=["GET"])
def get_categories():
    categories = list(db.categories.find())
    for category in categories:
        category["_id"] = str(category["_id"])
    return jsonify(categories), 200

@app.route("/get_post/<post_id>", methods=["GET"])
def get_post(post_id):
    post = db.posts.find_one({"id": int(post_id)})
    if post:
        post["_id"] = str(post["_id"])
        post["category_id"] = str(post["category_id"])
        return jsonify(post), 200
    return jsonify({"error": "Post not found"}), 404

@app.route("/get_users", methods=["GET"])
def get_users():
    users = list(db.users.find())
    for user in users:
        user["_id"] = str(user["_id"])
    return jsonify(users), 200

@app.route("/get_user/<user_id>", methods=["GET"])
def get_user(user_id):
    user = db.users.find_one({"id": int(user_id)})
    if user:
        user["_id"] = str(user["_id"])
        return user
    return None

# Protected Routes
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# Serving React App
@app.route('/', defaults={"path": ""})
@app.route("/<path:path>")
def serve_react_app(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == '__main__':
    app.run(debug=True, host="localhost", port=8000)
