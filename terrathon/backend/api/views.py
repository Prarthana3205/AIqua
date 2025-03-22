from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import math

#  Define the path to lakes.json
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAKES_FILE = os.path.join(BASE_DIR, "api", "lakes.json")

#  Function to load lake data
def load_lakes_data():
    if not os.path.exists(LAKES_FILE):
        return []
    with open(LAKES_FILE, "r", encoding="utf-8") as file:
        return json.load(file)

lakes_data = load_lakes_data()  # Load lakes once at startup

#  Function to calculate Haversine distance
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of Earth in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

#  Function to find the 5 nearest lakes
def find_nearest_lakes(user_lat, user_lon):
    lakes_with_distance = []
    unique_lakes = set()  # Ensure unique lakes are returned

    for lake in lakes_data:
        try:
            # Extract latitude and longitude from the lake data
            lat_lon = lake.get("Latitude and Longitude", "")
            if not lat_lon:
                continue  # Skip if missing coordinates

            lat_str, lon_str = lat_lon.split(",")
            lake_lat, lake_lon = float(lat_str.strip()), float(lon_str.strip())

            # Calculate the distance using the Haversine formula
            distance = haversine(user_lat, user_lon, lake_lat, lake_lon)

            # Use a combination of name and coordinates to ensure uniqueness
            lake_key = f"{lake.get('Lake Name', 'Unknown')}_{lake_lat}_{lake_lon}"
            if lake_key not in unique_lakes:  # Avoid duplicate lakes
                unique_lakes.add(lake_key)
                lakes_with_distance.append({
                    "name": lake.get("Lake Name", "Unknown"),
                    "latitude": lake_lat,
                    "longitude": lake_lon,
                    "distance": round(distance, 2)  # Round distance to 2 decimal places
                })

        except ValueError as e:
            print(f"Skipping malformed lake entry: {lake}. Error: {e}")
            continue

    # Sort lakes by distance and return the closest 5
    lakes_with_distance.sort(key=lambda x: x["distance"])
    return lakes_with_distance[:5]

@csrf_exempt
def coordinates(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            latitude = data.get("latitude")
            longitude = data.get("longitude")

            if latitude is None or longitude is None:
                return JsonResponse({"error": "Latitude and longitude are required"}, status=400)

            nearest_lakes = find_nearest_lakes(float(latitude), float(longitude))

            return JsonResponse({"nearest_lakes": nearest_lakes})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)

#  Dummy fetch_locations function (optional)
def fetch_locations(request):
    return JsonResponse({"message": "Fetching locations..."})
