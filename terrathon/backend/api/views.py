from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import math
import pandas as pd

#  Define the path to lakes.json and totalvalue.xlsx
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAKES_FILE = os.path.join(BASE_DIR, "api", "lakes.json")
EXCEL_FILE = os.path.join(BASE_DIR, "api", "totalvalue.xlsx")


# Dummy fetch_locations function (if you need it)
from django.http import JsonResponse

def fetch_locations(request):
    return JsonResponse({"message": "Fetching locations..."})


#  Load lake data
def load_lakes_data():
    if not os.path.exists(LAKES_FILE):
        return []
    with open(LAKES_FILE, "r", encoding="utf-8") as file:
        return json.load(file)

lakes_data = load_lakes_data()  # Load lakes once at startup
excel_data = pd.read_excel(EXCEL_FILE)  # Load the Excel file once at startup

#  Haversine formula to calculate distance between two lat/lon points
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of Earth in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

#  Find 15 nearest lakes
def find_nearest_lakes(user_lat, user_lon):
    lakes_with_distance = []
    unique_lakes = set()  # Ensure unique lakes are returned

    for lake in lakes_data:
        try:
            lat_lon = lake.get("Latitude and Longitude", "")
            if not lat_lon:
                continue

            lat_str, lon_str = lat_lon.split(",")
            lake_lat, lake_lon = float(lat_str.strip()), float(lon_str.strip())

            distance = haversine(user_lat, user_lon, lake_lat, lake_lon)
            lake_name = lake.get("Lake Name", "Unknown")
            lake_key = f"{lake_name}_{lake_lat}_{lake_lon}"

            if lake_key not in unique_lakes:
                unique_lakes.add(lake_key)
                lakes_with_distance.append({
                    "name": lake_name,
                    "latitude": lake_lat,
                    "longitude": lake_lon,
                    "distance": round(distance, 2)
                })

        except ValueError:
            continue

    lakes_with_distance.sort(key=lambda x: x["distance"])
    return lakes_with_distance[:15]

# New function to sort lakes by main_sum
@csrf_exempt
def sorted_lakes_by_main_sum(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            latitude = data.get("latitude")
            longitude = data.get("longitude")

            if latitude is None or longitude is None:
                return JsonResponse({"error": "Latitude and longitude are required"}, status=400)

            nearest_lakes = find_nearest_lakes(float(latitude), float(longitude))

            for lake in nearest_lakes:
                lake_name = lake["name"]
                lake_data = excel_data[excel_data["Lake Name"] == lake_name]
                main_sum_value = lake_data["main_sum"].iloc[0] if not lake_data.empty else None
                lake["main_sum"] = main_sum_value

            # Sort by main_sum in descending order
            sorted_lakes = sorted(nearest_lakes, key=lambda x: (x["main_sum"] if x["main_sum"] is not None else -float('inf')), reverse=True)

            return JsonResponse({"sorted_lakes": sorted_lakes})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)

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

            for lake in nearest_lakes:
                lake_name = lake["name"]
                lake_data = excel_data[excel_data["Lake Name"] == lake_name]
                
                # ✅ Ensure 'main_sum' key is added
                if not lake_data.empty and "main_sum" in lake_data.columns:
                    main_sum_value = lake_data["main_sum"].iloc[0]
                else:
                    main_sum_value = None
                
                lake["main_sum"] = main_sum_value

            return JsonResponse({"nearest_lakes": [
                {
                    "name": lake["name"],
                    "latitude": lake["latitude"],
                    "longitude": lake["longitude"],
                    "distance": lake["distance"],
                    "main_sum": lake["main_sum"] if lake["main_sum"] is not None else "N/A"
                }
                for lake in nearest_lakes
            ]})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)
