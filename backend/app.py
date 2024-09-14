# app.py
from flask import Flask, request, send_from_directory, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from pymongo import MongoClient
from flask_cors import CORS
import os
from dotenv import load_dotenv
import boto3
from botocore.exceptions import NoCredentialsError
from jose import jwt
from functools import wraps
from urllib.request import urlopen
import json
from datetime import datetime


load_dotenv()

app = Flask(__name__, static_folder="../react-app/build", static_url_path="")
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Adjust origins as needed
app.secret_key = os.urandom(24).hex()
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default_secret_key')
app.config['JWT_ALGORITHM'] = 'RS256'

jwt_manager = JWTManager(app)

# MongoDB Configuration
client = MongoClient(os.getenv("DATABASE_URL"))
db = client.get_database('volunteer_match')


# Configure AWS S3
S3_BUCKET = os.getenv("S3_BUCKET")
S3_KEY = os.getenv("S3_KEY")
S3_SECRET = os.getenv("S3_SECRET")

s3 = boto3.client('s3', aws_access_key_id=S3_KEY, aws_secret_access_key=S3_SECRET)

# Auth0 Configuration
AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
API_AUDIENCE = os.environ.get('AUTH0_AUDIENCE')
ALGORITHMS = ["RS256"]

# Fetch Auth0's JWKS
jwks_url = f'https://{AUTH0_DOMAIN}/.well-known/jwks.json'
jwks = json.loads(urlopen(jwks_url).read())

def get_token_auth_header():
    """Obtains the Access Token from the Authorization Header"""
    auth = request.headers.get("Authorization", None)
    if not auth:
        return jsonify({"message": "Authorization header missing."}), 401

    parts = auth.split()

    if parts[0].lower() != "bearer":
        return jsonify({"message": "Authorization header must start with Bearer."}), 401
    elif len(parts) == 1:
        return jsonify({"message": "Token not found."}), 401
    elif len(parts) > 2:
        return jsonify({"message": "Authorization header must be Bearer token."}), 401

    token = parts[1]
    return token

def verify_jwt(token):
    """Verifies the JWT using Auth0's public keys"""
    try:
        unverified_header = jwt.get_unverified_header(token)
    except jwt.JWTError:
        return jsonify({"message": "Invalid token header."}), 401

    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header.get("kid"):
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }
            break
    if rsa_key:
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer=f'https://{AUTH0_DOMAIN}/'
            )
            return payload
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired."}), 401
        except jwt.JWTClaimsError:
            return jsonify({"message": "Incorrect claims. Please, check the audience and issuer."}), 401
        except Exception:
            return jsonify({"message": "Unable to parse authentication token."}), 401
    return jsonify({"message": "Unable to find appropriate key."}), 401

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        payload = verify_jwt(token)
        if isinstance(payload, tuple):
            return payload  # Error response
        return f(payload, *args, **kwargs)
    return decorated

def find_user_by_id(user_id):
    """
    Retrieves a user from the database by their integer ID.
    
    Parameters:
        user_id (int): The unique integer ID of the user.
        
    Returns:
        dict or None: The user document if found, else None.
    """
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return None

    user = db.users.find_one({"id": user_id})
    if user:
        user["_id"] = str(user["_id"])
        user.pop("password", None)  # Exclude sensitive information
        return user
    return None

def find_user_by_sub(auth0_sub):
    """
    Retrieves a user from the database by their Auth0 'sub'.
    
    Parameters:
        auth0_sub (str): The Auth0 'sub' identifier of the user.
        
    Returns:
        dict or None: The user document if found, else None.
    """
    user = db.users.find_one({"auth0_sub": auth0_sub})
    if user:
        user["_id"] = str(user["_id"])
        user.pop("password", None)  # Exclude sensitive information
        return user
    return None

# Public Routes
@app.route("/status")
def status():
    return {"status": "running 💡"}, 200

@app.route("/get_posts", methods=["GET"])
def get_posts():
    """
    Retrieves all posts along with their author's first and last names.
    
    Returns:
        Response: JSON response containing a list of posts with author details.
    """
    posts = list(db.posts.find())
    for post in posts:
        post["_id"] = str(post["_id"])
        post["category_id"] = str(post["category_id"])
        
        # Use the helper function to retrieve author data by 'id'
        author_id = post.get("author_id")
        author_data = find_user_by_id(author_id)
        
        if author_data:
            post["author_first_name"] = author_data.get("first_name", "")
            post["author_last_name"] = author_data.get("last_name", "")
        else:
            post["author_first_name"] = "Unknown"
            post["author_last_name"] = "Author"

    return jsonify(posts), 200

@app.route("/get_categories", methods=["GET"])
def get_categories():
    categories = list(db.categories.find())
    for category in categories:
        category["_id"] = str(category["_id"])
    return jsonify(categories), 200

@app.route("/get_post/<post_id>", methods=["GET"])
def get_post(post_id):
    try:
        post_id = int(post_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid post ID."}), 400

    post = db.posts.find_one({"id": post_id})
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
        user.pop("password", None)  # Exclude sensitive information
    return jsonify(users), 200

@app.route("/get_user/<auth0_sub>", methods=["GET"])
def get_user_route(auth0_sub):
    """
    Retrieves a user by their Auth0 'sub'.
    
    Parameters:
        auth0_sub (str): The Auth0 'sub' identifier of the user.
        
    Returns:
        Response: JSON response containing user data or an error message.
    """
    user = find_user_by_sub(auth0_sub)
    if user:
        return jsonify(user), 200
    return jsonify({"message": "User not found."}), 404

# Protected Routes
@app.route("/protected", methods=["GET"])
@requires_auth
def protected_route(payload):
    current_user = payload['sub']  # Auth0 user ID
    return jsonify(logged_in_as=current_user), 200


@app.route("/upload_profile_picture", methods=["POST"])
@jwt_required()
def upload_profile_picture():
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    file_name = f"user_{user_id}_{file.filename}"

    try:
        s3.upload_fileobj(file, S3_BUCKET, file_name, ExtraArgs={'ACL': 'public-read', 'ContentType': file.content_type})
        image_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{file_name}"
        
        # Update the user's profile picture URL in the database
        db.users.update_one({"id": int(user_id)}, {"$set": {"profile_picture": image_url}})

        return jsonify({"image_url": image_url}), 200

    except NoCredentialsError:
        return jsonify({"error": "AWS credentials not available"}), 500

@app.route("/update_profile", methods=["PUT"])
def update_profile():
    data = request.get_json()
    auth0_sub = "google-oauth2|114635820434822493105"
    
    # Find the user by auth0_sub
    user = find_user_by_sub(auth0_sub)
    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json()

    update_fields = {}
    allowed_fields = ["first_name", "last_name", "phone_number", "location", "avatar_url", "bio"]

    for field in allowed_fields:
        if field in data:
            update_fields[field] = data[field]

    if not update_fields:
        return jsonify({"message": "No valid fields provided for update."}), 400

    db.users.update_one({"auth0_sub": auth0_sub}, {"$set": update_fields})

    updated_user = find_user_by_sub(auth0_sub)
    return jsonify({
        "message": "Profile updated successfully.",
        "user": updated_user
    }), 200

@app.route("/create_post", methods=["POST"])
def create_post():

    data = request.get_json()
    auth0_sub = "google-oauth2|114635820434822493105"
    
    # Find the user by auth0_sub
    user = find_user_by_id(auth0_sub)
    if not user:
        return jsonify({"message": "User not found."}), 404

    user_id = user['id']

    data = request.get_json()

    # Validate required fields
    required_fields = ["title", "description", "category_id"]
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"Missing field: {field}"}), 400

    # Optional fields
    image_url = data.get("image_url", "")
    location = data.get("location", "")
    requirements = data.get("requirements", [])

    # Generate a new post ID
    last_post = db.posts.find_one(sort=[("id", -1)])
    new_post_id = last_post['id'] + 1 if last_post else 1

    new_post = {
        "id": new_post_id,
        "title": data["title"],
        "author_id": user_id,
        "description": data["description"],
        "category_id": data["category_id"],
        "image_url": image_url,
        "location": location,
        "requirements": requirements,
        "date_created": datetime.utcnow()
    }

    db.posts.insert_one(new_post)

    new_post["_id"] = str(new_post["_id"])
    new_post["category_id"] = str(new_post["category_id"])

    return jsonify({
        "message": "Volunteering post created successfully.",
        "post": new_post
    }), 201


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
