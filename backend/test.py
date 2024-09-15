import requests
import os
from dotenv import load_dotenv

load_dotenv()


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
    print(payload)

    response = requests.post(url, json=payload, headers=headers)
    
    # Raise an error if the request fails
    response.raise_for_status()

    # Extract and return the access token
    return response.json()['access_token']


auth0_sub = "google-oauth2|101049132718397280763"

response = requests.get(f"https://{os.environ.get('AUTH0_DOMAIN')}/api/v2/users/{auth0_sub}", headers={
    'Authorization': f"Bearer {get_auth0_token()}"
})
data = response.json()
print(data)