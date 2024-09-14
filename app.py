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
from flask_cors import CORS
import os
import requests
from authlib.integrations.flask_client import OAuth
from functools import wraps

from mongodb import connect_to_mongodb

app = Flask(__name__, static_folder="./react-app/build", static_url_path="")
CORS(app)
app.secret_key = os.urandom(24).hex()
app.config['JWT_SECRET_KEY'] = "779cb7cbeb9fd89e59ab0d72c264c9326fac2954aa7ed90b"
jwt = JWTManager(app)

# Configure Auth0
app.config['AUTH0_CLIENT_ID'] = os.environ['AUTH0_CLIENT_ID']
app.config['AUTH0_CLIENT_SECRET'] = os.environ['AUTH0_CLIENT_SECRET']
app.config['AUTH0_DOMAIN'] = os.environ['AUTH0_DOMAIN']

oauth = OAuth(app)
auth0 = oauth.register(
    'auth0',
    client_id=os.environ['AUTH0_CLIENT_ID'],
    client_secret=os.environ['AUTH0_CLIENT_SECRET'],
    api_base_url=f'https://{os.environ["AUTH0_DOMAIN"]}',
    access_token_url=f'https://{os.environ["AUTH0_DOMAIN"]}/oauth/token',
    authorize_url=f'https://{os.environ["AUTH0_DOMAIN"]}/authorize',
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
                f"https://{app.config['AUTH0_DOMAIN']}/userinfo",
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
    token_url = f"https://{os.environ["AUTH0_DOMAIN"]}/oauth/token"
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


if __name__ == '__main__':
    app.run(debug=True, host="localhost")
    
