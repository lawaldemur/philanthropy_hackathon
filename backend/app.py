# app.py

from flask import Flask, request, redirect, send_from_directory, jsonify, session
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
// from flask_mail import Mail, Message
from pymongo import MongoClient
from flask_cors import CORS
import os
from geopy.geocoders import Nominatim
from dotenv import load_dotenv
import boto3
from botocore.exceptions import NoCredentialsError
from authlib.integrations.flask_client import OAuth
from functools import wraps
from urllib.request import urlopen
import json
# from datetime import datetime
import requests
import datetime

load_dotenv()

app = Flask(__name__, static_folder="../react-app/build", static_url_path="")

app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(hours=5)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
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

oauth = OAuth(app)
# auth0 = oauth.register(
#     'auth0',
#     client_id=os.environ.get('AUTH0_CLIENT_ID'),
#     client_secret=os.environ.get('AUTH0_CLIENT_SECRET'),
#     api_base_url='https://dev-1u4qab05mr75h3uz.us.auth0.com/',
#     access_token_url='https://dev-1u4qab05mr75h3uz.us.auth0.com/oauth/token',
#     authorize_url='https://dev-1u4qab05mr75h3uz.us.auth0.com/authorize',
#     client_kwargs={
#         'scope': 'openid profile email',
#     },
# )
auth0 = oauth.register(
    name='google',
    client_id=os.environ.get('GOOGLE_CLIENT_ID'),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET'),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',
    # This is only needed if using openId to fetch user info
    client_kwargs={'scope': 'openid email profile'},
    jwks_uri = "https://www.googleapis.com/oauth2/v3/certs"
)

@app.route('/api/login')
def login():
    return auth0.authorize_redirect(redirect_uri='http://localhost:8000/api/callback')

@app.route('/api/callback')
def callback_handling():
    auth0.authorize_access_token()
    resp = auth0.get('userinfo')
    user_info = resp.json()

    session['jwt_payload'] = user_info
    ### userinfo
    #{'id': '105290470073128554236', 'email': 'kiwick7@gmail.com', 'verified_email': True, 'name': 'Kiril', 'given_name': 'Kiril', 'picture': 'https://lh3.googleusercontent.com/a/ACg8ocLxzkIz7nSsa5N2yYDkK5vi10IzaufKc5HNVstFkSruIU3B1w=s96-c'}
    ###
    if find_user_by_email(user_info.get("email")) is None: 
        new_user = {
            "id": int(user_info["id"]) % 99999,
        "email": user_info.get("email"),
        "first_name": user_info.get("given_name"),
        "last_name": user_info.get("name").split()[-1],
        "auth0_sub": f"google-oauth2|{user_info.get('id')}",
        "bio": "New user",
        "location": "Unknown",
        "phone_number": "Unknown",
        "profile_pic_filename": "/placeholder.jpeg",
    }
    # Insert the user into the MongoDB collection
        result = db.users.insert_one(new_user)
    # print(userinfo)

    return redirect("/")


@app.route('/api/user-data')
def user_data():
    if 'jwt_payload' in session:
        user_email = session['jwt_payload']['email']
        user = db.users.find_one({'email': user_email})
        if user:
            return jsonify({
                'first_name': user['first_name'],
                'email': user['email'],
                'id': user['id'],
                'profile_pic_filename': user['profile_pic_filename'],
            })
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/logout')
def logout():
    session.clear()
    return redirect("/index")

@app.route("/find_user_by_id/<user_id>")
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



@app.route("/find_user_by_email/<user_email>")
def find_user_by_email(user_email):
    """
    Retrieves a user from the database by their string email.
    
    Parameters:
        user_email (string): The reliable identify of the user.
        
    Returns:
        dict or None: The user document if found, else None.
    """

    user = db.users.find_one({"email": user_email})
    if user:
        user["_id"] = str(user["_id"])
        user.pop("password", None)  # Exclude sensitive information
        return user
    return None



@app.route("/get_categories", methods=["GET"])
def get_categories():
    categories = list(db.categories.find())
    for category in categories:
        category["_id"] = str(category["_id"])
    return jsonify(categories), 200

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
    
    
    # create a new user
    response = requests.get(f"https://{os.environ.get('AUTH0_DOMAIN')}/api/v2/users/{auth0_sub}", headers={
        'Authorization': f"Bearer {get_auth0_token()}"
    })
    data = response.json()
    print(data)

    if "error" in data:
        return jsonify({"message": "User1 not found."}), 404
    
    return jsonify({"message": "User not found."}), 404


def get_auth0_token():
    url = f"https://dev-1u4qab05mr75h3uz.us.auth0.com/oauth/token"
    
    headers = {
        'content-type': 'application/json'
    }

    payload = {
        'client_id': os.environ.get('AUTH0_CLIENT_ID'),
        'client_secret': os.environ.get('AUTH0_CLIENT_SECRET'),
        'audience': f"https://{os.environ.get('AUTH0_DOMAIN')}/api/v2/",
        'grant_type': 'client_credentials'
    }

    response = requests.post(url, json=payload, headers=headers)
    
    # Raise an error if the request fails
    response.raise_for_status()

    # Extract and return the access token
    return response.json()['access_token']


@app.route("/upload_file", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file:
        filename = session["jwt_payload"]["id"] 
        
        file_path = os.path.join('profile_pics', filename)  # Specify the desired file path in S3

        try:
            s3.upload_fileobj(file, S3_BUCKET, file_path, ExtraArgs={'ACL': 'public-read', 'ContentType': file.content_type})
            file_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{file_path}"
            
            db.users.update_one(
            {'email': session['jwt_payload']['email']},  # Filter to select the correct user
            {'$set': {'profile_pic_filename': filename}}  # Update the profile_pic_filename field
)

            return jsonify({"file_url": file_url}), 200

        except NoCredentialsError:
            return jsonify({"error": "AWS credentials not available"}), 500
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Invalid file"}), 400

@app.route("/update_profile/<auth0_sub>", methods=["PUT"])
def update_profile(auth0_sub):    
    # Find the user by auth0_sub
    user = find_user_by_sub(auth0_sub)
    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json()

    # Fields allowed to be updated
    allowed_fields = ["first_name", "last_name", "phone_number", "location", "avatar_url", "bio"]

    # Build the update fields dictionary
    update_fields = {field: data[field] for field in allowed_fields if field in data}

    if not update_fields:
        return jsonify({"message": "No valid fields provided for update."}), 400

    # Update the user profile
    db.users.update_one({"auth0_sub": auth0_sub}, {"$set": update_fields})

    # Fetch the updated user data
    updated_user = find_user_by_sub(auth0_sub)
    return jsonify({
        "message": "Profile updated successfully.",
        "user": updated_user
    }), 200


@app.route("/create_post/<auth0_sub>", methods=["POST"])
def create_post(auth0_sub):
    """
    Create a new volunteering post for the given auth0_sub.
    """
    # Find the user by user_id
    user = find_user_by_sub(auth0_sub)
    if not user:
        return jsonify({"message": "User not found."}), 404

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

    #API call to get the latitude and longitude
    geolocator = Nominatim(user_agent="HopHacks2024")
    position = geolocator.geocode(location, country_codes="US")

    # Create the new post
    new_post = {
        "id": new_post_id,
        "title": data["title"],
        "author_id": user["id"],
        "description": data["description"],
        "category_id": data["category_id"],
        "image_url": image_url,
        "location": location,
        "lat": position.latitude,
        "lng": position.longitude,
        "requirements": requirements,
        "date_created": datetime.datetime.utcnow()
    }

    # Insert the post into the database
    db.posts.insert_one(new_post)

    # Format the response
    new_post["_id"] = str(new_post["_id"])
    new_post["category_id"] = str(new_post["category_id"])

    return jsonify({
        "message": "Volunteering post created successfully.",
        "post": new_post
    }), 201

# Serving React App
@app.route('/', defaults={"path": ""})
@app.route('/profile', defaults={"path": "/profile"})
def serve_react_app(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")
    

# app.config['MAIL_SERVER'] = 'smtp.gmail.com'
# app.config['MAIL_PORT'] = 465
# app.config['MAIL_USERNAME'] = os.getenv("EMAIL_USER")
# app.config['MAIL_PASSWORD'] = os.getenv("EMAIL_PASS")
# app.config['MAIL_USE_TLS'] = False
# app.config['MAIL_USE_SSL'] = True

# mail = Mail(app)

# @app.route('/send-email/<recipient_email>', methods=['POST'])
# def send_email(recipient_email):
#     if not recipient_email:
#         return jsonify({'error': 'Email address is required'}), 400
    
#     EMAIL_SUBJECT = "New Request From Volunteer Hub!"
#     EMAIL_BODY = """
#     Hello,

#     You recieved a new activity request from ####! We are excited to have you on board.

#     Best regards,
#     The Volunteer Team
#     """

#     try:
#         # Send the email
#         msg = Message(EMAIL_SUBJECT, sender=app.config['MAIL_USERNAME'], recipients=[recipient_email])
#         msg.body = EMAIL_BODY
#         mail.send(msg)

#         return jsonify({'message': f'Email sent successfully to {recipient_email}!'}), 200
#     except Exception as e:
#         return jsonify({'error': f'Failed to send email: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, host="localhost", port=8000)
