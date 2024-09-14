from pymongo import MongoClient
import os
from dotenv import load_dotenv


load_dotenv()


def connect_to_mongodb():
    try:
        client = MongoClient(os.getenv("DATABASE_URL"))
        db = client.get_database('volunteer_match')
        return "Connected to MongoDB successfully!"
    except Exception as e:
        print(f"An error occurred while connecting to MongoDB: {e}")
        return None


def get_posts():
    client = MongoClient(os.getenv("DATABASE_URL"))
    db = client.get_database('volunteer_match')
    posts = db.post.find()
    return posts


def get_post(post_id):
    client = MongoClient(os.getenv("DATABASE_URL"))
    db = client.get_database('volunteer_match')
    post = db.post.find_one({"_id": post_id})
    return post


def create_post(post_data):
    client = MongoClient(os.getenv("DATABASE_URL"))
    db = client.get_database('volunteer_match')
    result = db.post.insert_one(post_data)
    return result


def get_users():
    client = MongoClient(os.getenv("DATABASE_URL"))
    db = client.get_database('volunteer_match')
    users = db.user.find()
    return users


def get_user(user_id):
    client = MongoClient(os.getenv("DATABASE_URL"))
    db = client.get_database('volunteer_match')
    user = db.user.find_one({"_id": user_id})
    return user


if __name__ == "__main__":
    posts = get_posts()

    for post in posts:
        print(post)

    print("Done!")