from django.urls import path
from .views import coordinates, fetch_locations, sorted_lakes_by_main_sum

urlpatterns = [
    path("coordinates/", coordinates, name="coordinates"),
    path("fetch_locations/", fetch_locations, name="fetch_locations"),
    path("sorted_lakes_by_main_sum/", sorted_lakes_by_main_sum, name="sorted_lakes_by_main_sum"),
]
