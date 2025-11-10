from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Tuple, List
from dotenv import load_dotenv
import os
from pymongo import MongoClient
import requests

from geopy.distance import geodesic

load_dotenv()

# Environment variables
MONGO_CONN = os.environ.get("MONGODB_CONNECTION_STRING")
MONGODB_DB = os.environ.get("MONGODB_DB")
MONGODB_COL = os.environ.get("MONGODB_COL")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
client = MongoClient(MONGO_CONN)
col = client[MONGODB_DB][MONGODB_COL]
radius = 10  # 10 km

class Address(BaseModel):
    address: str

app = FastAPI(
    title="Risk Assessor API",
    description="Risk Assessor API for the Risk Assessor application",
    version="0.0.1",
    redirect_slashes=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers to the client
    max_age=3600,  # Cache preflight requests for 1 hour
)

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

year_colors = {
    2016: 'blue',
    2017: 'green',
    2018: 'yellow',
    2019: 'orange',
    2020: 'red',
}


def geocode(address: str, api_key: str) -> Tuple[float, float]:
    # Construct the URL for the Google Geocoding API
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"

    # Send the HTTP request
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()

        # Check if the response contains any results
        if data['status'] == 'OK':
            # Extract latitude and longitude from the first result
            location = data['results'][0]['geometry']['location']
            latitude = location['lat']
            longitude = location['lng']
            return longitude, latitude
        else:
            raise ValueError(f"Geocoding failed. Status: {data['status']}")
    else:
        raise ConnectionError(f"HTTP request failed. Status code: {response.status_code}")

def rev_geocode(latitude: float, longitude: float, api_key: str) -> str:
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={latitude},{longitude}&key={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'OK':
            address = data['results'][0]['formatted_address']
            return address
        else:
            raise ValueError(f"Reverse geocoding failed. Status: {data['status']}")
    else:
        raise ConnectionError(f"HTTP request failed. Status code: {response.status_code}")


@app.get("/")
async def root():
    return {"status": "Server is running!"}


@app.get("/rev_geocode")
def get_address(latitude: float, longitude: float):
    try:
        address = rev_geocode(latitude, longitude, GOOGLE_API_KEY)
        print(address)
        return {"address": address}
    except Exception as e:
        return {"error": str(e)}

def generate_circle_points(center, radius=5):
    points = []
    for i in range(120):
        bearing = 3*i
        dest = geodesic(kilometers=radius).destination((center['latitude'],center['longitude']), bearing)
        points.append(f"{dest.latitude},{dest.longitude}")
    return points

def get_static_map_url(data: List[dict]):
    if len(data) > 15:
        data = data[:15]  
    base_url = "https://maps.googleapis.com/maps/api/staticmap?"
    center = data.pop(0)
    center_param = f"center={center['latitude']},{center['longitude']}&markers=color:black%7Clabel:C%7C{center['latitude']},{center['longitude']}"
    markers_params = [
        f"markers=size:mid%7Ccolor:{year_colors.get(coord['year'], 'red')}%7Clabel:F%7C{coord['latitude']},{coord['longitude']}"
        for coord in data
    ]
    markers_param = "&".join(markers_params)
    path_params = generate_circle_points(center)
    path_param = "|".join(path_params)
    url = f"{base_url}{center_param}&zoom=11&size=400x400&{markers_param}&path=color:black|weight:5|{path_param}&key={GOOGLE_API_KEY}"
    #print(url)
    return url

@app.post("/static-map")
async def generate_static_map(data: List[dict]):
    try:
        url = get_static_map_url(data)
        response = requests.get(url)
        headers = {'Content-Type': 'image/jpeg'}
        return Response(content=response.content, media_type='image/jpeg', headers=headers)
    except Exception as e:
        print("Error:", e)

@app.post("/address/")
async def get_coordinates(address: Address):
    try:
        longitude, latitude = geocode(address.address, GOOGLE_API_KEY)
        #longitude, latitude  = -73.98460990000001, 40.7620791

        pipeline = [
            {"$geoNear": {"near": {"type": "Point", "coordinates": [longitude, latitude]},
                          "distanceField": "DISTANCE", "spherical": True, "maxDistance": radius * 1000}},
            {"$project": {"year": 1, "COORD": 1,"DISTANCE": 1}},
            {"$match": {"year": {"$gte": 2016}}},
            {"$sort": { "year":-1, "DISTANCE":1 } }, 
        ]
        print(pipeline)
        documents = list(col.aggregate(pipeline))
        print(documents)
        response = [{
            "longitude": longitude,
            "latitude": latitude
            }]
        for doc in documents:
            response.append({"longitude": doc['COORD']['coordinates'][0], "latitude": doc['COORD']['coordinates'][1], "year": doc['year']})        
        return response

    except Exception as e:
        print("Error:", e)

@app.get("/coordinates/")
async def get_data(latitude: float, longitude: float):
    try:
        pipeline = [
            {"$geoNear": {"near": {"type": "Point", "coordinates": [longitude, latitude]},
                          "distanceField": "DISTANCE", "spherical": True, "maxDistance": radius * 1000}},
            {"$project": {"year": 1, "COORD": 1,"DISTANCE": 1}},
            {"$match": {"year": {"$gte": 2016}}},
            {"$sort": { "year":-1, "DISTANCE":1 } }, 
        ]
        print(pipeline)
        documents = list(col.aggregate(pipeline))
        print(documents)
        response = [{
            "longitude": longitude,
            "latitude": latitude
            }]
        for doc in documents:
            response.append({"longitude": doc['COORD']['coordinates'][0], "latitude": doc['COORD']['coordinates'][1], "year": doc['year'],  "distance": doc['DISTANCE']})        
        return response

    except Exception as e:
        print("Error:", e)
