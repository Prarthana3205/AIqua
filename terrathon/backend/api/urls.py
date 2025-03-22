from django.urls import path
from .views import coordinates, fetch_locations  # ✅ Now should work

urlpatterns = [
    path("coordinates/", coordinates, name="coordinates"),
    path("fetch_locations/", fetch_locations, name="fetch_locations"),
]
