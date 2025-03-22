from django.db import models

class Location(models.Model):
    latitude = models.FloatField(db_index=True)  # Indexed for fast lookups
    longitude = models.FloatField(db_index=True)  # Indexed for fast lookups
    location_name = models.CharField(max_length=255, unique=True)  # Ensure uniqueness

    def __str__(self):
        return f"{self.location_name} ({self.latitude}, {self.longitude})"

