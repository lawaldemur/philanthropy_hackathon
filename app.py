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
from mongodb import connect_to_mongodb

app = Flask(__name__, static_folder="./react-app/build", static_url_path="")

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
    app.run(debug=True)
