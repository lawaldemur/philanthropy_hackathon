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
from authlib.integrations.flask_client import OAuth
from mongodb import connect_to_mongodb

app = Flask(__name__, static_folder="./react-app/build", static_url_path="")

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

@app.route('/auth/callback')
def callback():
    token = auth0.authorize_access_token()
    user_info = auth0.get('userinfo').json()
    return jsonify(user_info)


# Redirects to built react app
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def main(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


@app.route('/home')
def about():
    return "This is the about page!"


@app.route('/db')
def db():
    return connect_to_mongodb()


if __name__ == '__main__':
    app.run(debug=True, host="localhost")
    
