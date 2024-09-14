from flask import (
    Flask,
    request,
    send_from_directory,
    session,
    url_for,
    redirect,
    jsonify,
)
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
from pymongo import MongoClient
from flask_cors import CORS
import os
import requests
from authlib.integrations.flask_client import OAuth
from functools import wraps
from dotenv import load_dotenv

<<<<<<< HEAD
# Load environment variables from .env file
=======
>>>>>>> 5362735 (Insert db data into the frontend)
load_dotenv()

app = Flask(__name__, static_folder="../react-app/build", static_url_path="")
CORS(app)
app.secret_key = os.urandom(24).hex()
app.config['JWT_SECRET_KEY'] = "779cb7cbeb9fd89e59ab0d72c264c9326fac2954aa7ed90b"
jwt = JWTManager(app)

# Configure Auth0
app.config['AUTH0_CLIENT_ID'] = os.environ['AUTH0_CLIENT_ID']
app.config['AUTH0_CLIENT_SECRET'] = os.environ['AUTH0_CLIENT_SECRET']
app.config['AUTH0_DOMAIN'] = os.environ['AUTH0_DOMAIN']

client = MongoClient(os.getenv("DATABASE_URL"))
db = client.get_database('volunteer_match')

oauth = OAuth(app)
auth0 = oauth.register(
    'auth0',
    client_id=os.environ['AUTH0_CLIENT_ID'],
    client_secret=os.environ['AUTH0_CLIENT_SECRET'],
    api_base_url="https://" + os.environ['AUTH0_DOMAIN'],
    access_token_url='https://' + os.environ["AUTH0_DOMAIN"] + "/oauth/token",
    authorize_url='https://' + os.environ["AUTH0_DOMAIN"] + "/authorize",
    client_kwargs={'scope': 'openid profile email'}
)

# Middleware to validate access token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', None)
        if token is None:
            return jsonify({'message': 'Token is missing'}), 401

        # Strip "Bearer " from token if present
        token = token.replace('Bearer ', '')
        try:
            json_response = requests.get(
                "https://" + app.config['AUTH0_DOMAIN'] + "/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            if json_response.status_code != 200:
                raise Exception('Token is invalid')
        except:
            return jsonify({'message': 'Token is invalid'}), 401

        return f(*args, **kwargs)
    return decorated


@app.route('/callback')
def callback_handling():
    # 1. Get the authorization code from the URL
    code = request.args.get('code')

    # 2. Exchange the authorization code for access and ID tokens
    token_url = "https://" + os.environ['AUTH0_DOMAIN'] + "/oauth/token"
    token_payload = {
        'grant_type': 'authorization_code',
        'client_id': os.environ['AUTH0_CLIENT_ID'],
        'client_secret': os.environ['AUTH0_CLIENT_SECRET'],
        'code': code,
        'redirect_uri': "http://localhost:3000/callback"
    }

    token_info = requests.post(token_url, json=token_payload).json()

    # 3. Process the tokens (e.g., store them in session, use ID token for user info)
    session['user'] = token_info

    return redirect('/home')



# Redirects to built react app
@token_required
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def main(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


@token_required
@app.route('/home')
def about():
    return "This is the about page!"

@app.route("/status")
def status():
    return {"status ": "running 💡"}


@app.route("/get_posts")
def get_posts():
    posts = list(db.posts.find())
    
    for post in posts:
        post["_id"] = str(post["_id"])

        author_data = get_user(post["author_id"])
        post["author_first_name"] = author_data["first_name"]
        post["author_last_name"] = author_data["last_name"]

    return posts


@app.route("/get_post/<post_id>")
def get_post(post_id):
    post = db.posts.find_one({"id": int(post_id)})
    post["_id"] = str(post["_id"])
    return post


@app.route("/get_users")
def get_users():
    users = list(db.users.find())

    for user in users:
        user["_id"] = str(user["_id"])

    return users


@app.route("/get_user/<user_id>")
def get_user(user_id):
    user = db.users.find_one({"id": int(user_id)})
    user["_id"] = str(user["_id"])
    return user


if __name__ == '__main__':
    app.run(debug=True, host="localhost", port=8000)

