"""
KartverketAPI - Integration with Norwegian Mapping Authority (Kartverket)

This module provides a client for the Kartverket API, allowing access to
property data and maps.
"""
import requests
import logging
import os
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import math

logger = logging.getLogger(__name__)

class KartverketAPI:
    """Client for the Kartverket API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the Kartverket API client."""
        self.api_key = api_key or os.getenv("KARTVERKET_API_KEY")
        
        # Base URLs for different Kartverket APIs
        self.matrikkel_url = "https://matrikkel.api.kartverket.no/v1"
        self.ssrfakta_url = "https://ws.geonorge.no/SKWS/wfs/v2"
        self.elevation_url = "https://api.kartverket.no/høydedata/v1/punkter"
        
        # Cache for API responses
        self.cache = {}
        self.cache_expiration = {}
        self.cache_duration = timedelta(hours=24)  # Cache for 24 hours
        
        logger.info("KartverketAPI initialized")
    
    def _make_request(self, url: str, params: Dict[str, Any] = None, headers: Dict[str, str] = None) -> Dict[str, Any]:
        """Make a request to the Kartverket API."""
        if not headers:
            headers = {}
        
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        
        # Check cache
        cache_key = f"{url}_{json.dumps(params or {})}"
        if cache_key in self.cache and datetime.now() < self.cache_expiration.get(cache_key, datetime.now()):
            logger.info(f"Using cached response for {url}")
            return self.cache[cache_key]
        
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            # Parse response
            data = response.json()
            
            # Cache response
            self.cache[cache_key] = data
            self.cache_expiration[cache_key] = datetime.now() + self.cache_duration
            
            return data
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making request to {url}: {str(e)}")
            raise
    
    def get_property_by_address(self, address: str, municipality: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get property information by address.
        
        Args:
            address: The property address
            municipality: Optional municipality name to narrow search
            
        Returns:
            Property information if found, None otherwise
        """
        # For demonstration purposes, we'll use a mock response
        # In a real implementation, this would make an API call to Kartverket
        
        # Mock search by address
        if "solbergveien" in address.lower():
            return {
                "property_id": "3005-12-345-6-7",
                "address": "Solbergveien 47, 3057 Solbergmoen",
                "municipality_code": "3005",
                "municipality_name": "Drammen",
                "gnr": 12,
                "bnr": 345,
                "fnr": 6,
                "snr": 7,
                "area": 850.5,
                "property_type": "Bolig",
                "coordinates": {
                    "latitude": 59.7563,
                    "longitude": 10.2548,
                    "epsg": "EPSG:4326"
                }
            }
        
        # If address not found in our mock data
        return None
    
    def get_property_by_matrikkel(self, municipality_code: str, gnr: int, bnr: int, 
                                 fnr: Optional[int] = None, snr: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """
        Get property information by matrikkel numbers.
        
        Args:
            municipality_code: Municipality code (kommunenummer)
            gnr: Gårdsnummer
            bnr: Bruksnummer
            fnr: Festenummer (optional)
            snr: Seksjonsnummer (optional)
            
        Returns:
            Property information if found, None otherwise
        """
        # For demonstration purposes, we'll use a mock response
        # In a real implementation, this would make an API call to Kartverket
        
        # Mock property lookup
        if municipality_code == "3005" and gnr == 12 and bnr == 345:
            return {
                "property_id": "3005-12-345-6-7",
                "address": "Solbergveien 47, 3057 Solbergmoen",
                "municipality_code": "3005",
                "municipality_name": "Drammen",
                "gnr": 12,
                "bnr": 345,
                "fnr": 6,
                "snr": 7,
                "area": 850.5,
                "property_type": "Bolig",
                "coordinates": {
                    "latitude": 59.7563,
                    "longitude": 10.2548,
                    "epsg": "EPSG:4326"
                }
            }
        
        # If property not found in our mock data
        return None
    
    def get_elevation_data(self, latitude: float, longitude: float) -> Optional[float]:
        """
        Get elevation data for a specific coordinate.
        
        Args:
            latitude: Latitude in EPSG:4326
            longitude: Longitude in EPSG:4326
            
        Returns:
            Elevation in meters above sea level, or None if not available
        """
        # For demonstration purposes, this is a mock implementation
        # In a real implementation, this would make an API call to Kartverket's elevation API
        
        # Extremely simplified elevation model: sine wave based on coordinates
        if latitude and longitude:
            # Mock elevation calculations
            elevation = 100 + 50 * math.sin(latitude * 10) * math.cos(longitude * 10)
            return round(elevation, 2)
        
        return None
    
    def get_terrain_profile(self, start_lat: float, start_lon: float, 
                          end_lat: float, end_lon: float, 
                          num_points: int = 100) -> List[Dict[str, float]]:
        """
        Get terrain profile between two coordinates.
        
        Args:
            start_lat: Start latitude
            start_lon: Start longitude
            end_lat: End latitude
            end_lon: End longitude
            num_points: Number of points in the profile
            
        Returns:
            List of points with lat, lon, and elevation
        """
        # For demonstration purposes, this is a mock implementation
        # In a real implementation, this would make an API call to Kartverket's elevation API
        
        profile = []
        for i in range(num_points):
            # Interpolate between start and end coordinates
            fraction = i / (num_points - 1)
            lat = start_lat + fraction * (end_lat - start_lat)
            lon = start_lon + fraction * (end_lon - start_lon)
            
            # Get elevation for this point
            elevation = self.get_elevation_data(lat, lon)
            
            profile.append({
                "latitude": lat,
                "longitude": lon,
                "elevation": elevation,
                "distance": fraction * self._haversine_distance(start_lat, start_lon, end_lat, end_lon)
            })
        
        return profile
    
    def get_property_boundaries(self, municipality_code: str, gnr: int, bnr: int) -> Optional[Dict[str, Any]]:
        """
        Get property boundaries in GeoJSON format.
        
        Args:
            municipality_code: Municipality code (kommunenummer)
            gnr: Gårdsnummer
            bnr: Bruksnummer
            
        Returns:
            GeoJSON polygon representing the property boundaries, or None if not available
        """
        # For demonstration purposes, this is a mock implementation
        # In a real implementation, this would make an API call to Kartverket
        
        # Mock simple polygon for a property
        if municipality_code == "3005" and gnr == 12 and bnr == 345:
            return {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [10.2540, 59.7560],
                        [10.2550, 59.7560],
                        [10.2550, 59.7570],
                        [10.2540, 59.7570],
                        [10.2540, 59.7560]
                    ]]
                },
                "properties": {
                    "municipality_code": municipality_code,
                    "gnr": gnr,
                    "bnr": bnr,
                    "area": 850.5,
                    "property_type": "Bolig"
                }
            }
        
        return None
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two coordinates in kilometers.
        
        Args:
            lat1: Start latitude
            lon1: Start longitude
            lat2: End latitude
            lon2: End longitude
            
        Returns:
            Distance in kilometers
        """
        # Convert latitude and longitude from degrees to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Haversine formula
        dlon = lon2_rad - lon1_rad
        dlat = lat2_rad - lat1_rad
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        radius = 6371  # Earth radius in kilometers
        
        return c * radius 