"""
Kartverket API Client for the Eiendomsmuligheter Platform.

This module provides a comprehensive interface to the Norwegian Mapping Authority (Kartverket) APIs,
focusing on property data, maps, and geographical information retrieval including:
- Property details (matrikkeldata)
- Property boundaries (eiendomsgrenser)
- Map data and imagery
- 3D terrain models
- Historical property data
"""
import os
import requests
import logging
import json
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import time
import hashlib
from urllib.parse import urljoin

# Set up logging
logger = logging.getLogger(__name__)

# Default configuration for API
DEFAULT_CONFIG = {
    "base_url": "https://www.kartverket.no/api/",
    "matrikkel_url": "https://matrikkel.no/api/v1/",
    "seeiendom_url": "https://seeiendom.kartverket.no/api/",
    "wms_url": "https://wms.geonorge.no/skwms1/wms.nib",
    "wfs_url": "https://wfs.geonorge.no/skwfs/wfs.eiendom",
    "cache_timeout": 3600,  # Seconds
    "rate_limit": 5,  # Requests per second
    "max_retries": 3,
    "timeout": 30,  # Seconds
}

class KartverketAPIError(Exception):
    """Custom exception for Kartverket API errors"""
    def __init__(self, message: str, status_code: Optional[int] = None, response: Optional[dict] = None):
        self.message = message
        self.status_code = status_code
        self.response = response
        super().__init__(self.message)

class KartverketAPI:
    """Client for interacting with Kartverket's APIs"""
    
    def __init__(self, api_key: Optional[str] = None, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the Kartverket API client.
        
        Args:
            api_key: Optional API key for authenticated endpoints
            config: Optional configuration overrides
        """
        self.api_key = api_key or os.getenv("KARTVERKET_API_KEY")
        self.config = {**DEFAULT_CONFIG, **(config or {})}
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "EiendomsmuligheterPlatform/1.0",
            "Accept": "application/json",
        })
        
        if self.api_key:
            self.session.headers.update({
                "X-API-Key": self.api_key
            })
        
        self.last_request_time = 0
        self.cache = {}  # Simple in-memory cache
            
    def _make_request(self, method: str, endpoint: str, base_url_key: str = "base_url", 
                     params: Optional[Dict[str, Any]] = None, data: Optional[Dict[str, Any]] = None, 
                     headers: Optional[Dict[str, str]] = None, use_cache: bool = True) -> Dict[str, Any]:
        """
        Make a request to the Kartverket API with rate limiting and caching.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            base_url_key: Key for the base URL in config
            params: Optional query parameters
            data: Optional request body
            headers: Optional request headers
            use_cache: Whether to use and update cache
            
        Returns:
            API response as dictionary
            
        Raises:
            KartverketAPIError: If the API request fails
        """
        # Rate limiting
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        if time_since_last_request < 1.0 / self.config["rate_limit"]:
            time.sleep(1.0 / self.config["rate_limit"] - time_since_last_request)
        
        # Create cache key if caching is enabled
        cache_key = None
        if use_cache and method.upper() == 'GET':
            cache_components = [endpoint, str(params or {})]
            cache_key = hashlib.md5(json.dumps(cache_components).encode()).hexdigest()
            
            # Check cache
            if cache_key in self.cache:
                cache_entry = self.cache[cache_key]
                if current_time - cache_entry["timestamp"] < self.config["cache_timeout"]:
                    logger.debug(f"Cache hit for {endpoint}")
                    return cache_entry["data"]
        
        # Prepare request
        url = urljoin(self.config[base_url_key], endpoint)
        request_headers = {**self.session.headers, **(headers or {})}
        
        # Execute request with retries
        retries = 0
        while retries <= self.config["max_retries"]:
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    params=params,
                    json=data,
                    headers=request_headers,
                    timeout=self.config["timeout"]
                )
                self.last_request_time = time.time()
                
                # Check for HTTP errors
                response.raise_for_status()
                
                try:
                    response_data = response.json()
                except ValueError:
                    # Not a JSON response
                    if response.content:
                        logger.warning(f"Non-JSON response from {endpoint}: {response.content[:100]}...")
                        raise KartverketAPIError(
                            message=f"Invalid JSON response from {endpoint}",
                            status_code=response.status_code
                        )
                    response_data = {}
                
                # Update cache if enabled
                if use_cache and method.upper() == 'GET' and cache_key:
                    self.cache[cache_key] = {
                        "data": response_data,
                        "timestamp": time.time()
                    }
                
                return response_data
                
            except requests.exceptions.RequestException as e:
                retries += 1
                if retries > self.config["max_retries"]:
                    logger.error(f"Failed to call {endpoint} after {retries} attempts: {str(e)}")
                    raise KartverketAPIError(
                        message=f"Request failed after {retries} attempts: {str(e)}",
                        status_code=getattr(e.response, 'status_code', None),
                        response=getattr(e.response, 'json', lambda: None)()
                    )
                # Exponential backoff
                time.sleep(2 ** retries)
    
    def get_property_by_id(self, municipality_code: str, gnr: int, bnr: int, 
                         fnr: Optional[int] = None, snr: Optional[int] = None) -> Dict[str, Any]:
        """
        Retrieve property information by official property identifiers.
        
        Args:
            municipality_code: Norwegian municipality code (kommunenummer)
            gnr: Property main number (gårdsnummer)
            bnr: Property sub-number (bruksnummer)
            fnr: Optional leasehold number (festenummer)
            snr: Optional section number (seksjonsnummer)
            
        Returns:
            Property data as dictionary
        """
        endpoint = f"matrikkel/eiendom/{municipality_code}/{gnr}/{bnr}"
        if fnr is not None:
            endpoint += f"/{fnr}"
            if snr is not None:
                endpoint += f"/{snr}"
        
        return self._make_request(
            method="GET",
            endpoint=endpoint,
            base_url_key="matrikkel_url"
        )
    
    def get_property_by_address(self, address: str, municipality: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Search for properties by address.
        
        Args:
            address: Address string to search for
            municipality: Optional municipality name to filter results
            
        Returns:
            List of matching properties
        """
        params = {"address": address}
        if municipality:
            params["municipality"] = municipality
        
        return self._make_request(
            method="GET",
            endpoint="matrikkel/sok/adresse",
            base_url_key="matrikkel_url",
            params=params
        )
    
    def get_property_boundaries(self, municipality_code: str, gnr: int, bnr: int) -> Dict[str, Any]:
        """
        Get the geographical boundaries of a property.
        
        Args:
            municipality_code: Norwegian municipality code (kommunenummer)
            gnr: Property main number (gårdsnummer)
            bnr: Property sub-number (bruksnummer)
            
        Returns:
            GeoJSON representation of property boundaries
        """
        params = {
            "kommunenr": municipality_code,
            "gardsnr": gnr,
            "bruksnr": bnr,
            "format": "geojson"
        }
        
        return self._make_request(
            method="GET",
            endpoint="wfs",
            base_url_key="wfs_url",
            params=params
        )
    
    def get_property_owners(self, municipality_code: str, gnr: int, bnr: int, 
                          fnr: Optional[int] = None, snr: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get the owner information for a property.
        
        Note: This is mock data as actual owner information requires
        authenticated access to Kartverket's APIs and may have privacy restrictions.
        
        Args:
            municipality_code: Norwegian municipality code (kommunenummer)
            gnr: Property main number (gårdsnummer)
            bnr: Property sub-number (bruksnummer)
            fnr: Optional leasehold number (festenummer)
            snr: Optional section number (seksjonsnummer)
            
        Returns:
            List of property owners
        """
        # In a real implementation, this would make an authenticated API call
        # to Kartverket's APIs. For this prototype, we return mock data.
        logger.warning("Using mock data for property owners - this would require authenticated API access")
        
        return [{
            "owner_id": f"owner-{hash(f'{municipality_code}-{gnr}-{bnr}') % 1000}",
            "owner_type": "person",
            "owner_name": "Ola Nordmann",
            "ownership_percentage": 100.0,
            "acquisition_date": datetime.now().isoformat()
        }]
    
    def get_property_transactions(self, municipality_code: str, gnr: int, bnr: int) -> List[Dict[str, Any]]:
        """
        Get historical transactions for a property.
        
        Note: This is mock data as actual transaction information requires
        authenticated access to Kartverket's APIs.
        
        Args:
            municipality_code: Norwegian municipality code (kommunenummer)
            gnr: Property main number (gårdsnummer)
            bnr: Property sub-number (bruksnummer)
            
        Returns:
            List of property transactions
        """
        # In a real implementation, this would make an authenticated API call
        # For now, we return mock data
        logger.warning("Using mock data for property transactions - this would require authenticated API access")
        
        return [{
            "transaction_id": f"transaction-{hash(f'{municipality_code}-{gnr}-{bnr}') % 1000}",
            "transaction_date": (datetime.now().replace(year=datetime.now().year - 5)).isoformat(),
            "transaction_type": "sale",
            "price": 4200000.0,
            "buyer_name": "Ola Nordmann",
            "seller_name": "Kari Nordmann"
        }]
    
    def get_terrain_model(self, latitude: float, longitude: float, radius: float = 500) -> Dict[str, Any]:
        """
        Get 3D terrain model data for a location.
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            radius: Radius in meters around the location
            
        Returns:
            Terrain model data
        """
        params = {
            "lat": latitude,
            "lon": longitude,
            "radius": radius,
            "format": "json"
        }
        
        return self._make_request(
            method="GET",
            endpoint="hoydedata/terreng",
            params=params
        )
    
    def get_map_image(self, latitude: float, longitude: float, zoom: int = 15, 
                     width: int = 800, height: int = 600, layer: str = "topo4") -> bytes:
        """
        Get a map image centered at specified coordinates.
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            zoom: Zoom level (1-20)
            width: Image width in pixels
            height: Image height in pixels
            layer: Map layer type (topo4, orto, etc.)
            
        Returns:
            Binary image data
        """
        params = {
            "service": "WMS",
            "version": "1.3.0",
            "request": "GetMap",
            "layers": layer,
            "styles": "",
            "crs": "EPSG:4326",
            "bbox": f"{latitude - 0.01 * zoom},{longitude - 0.01 * zoom},{latitude + 0.01 * zoom},{longitude + 0.01 * zoom}",
            "width": width,
            "height": height,
            "format": "image/png"
        }
        
        # For image requests, we bypass the JSON handling
        url = urljoin(self.config["wms_url"], "")
        response = self.session.get(url, params=params, timeout=self.config["timeout"])
        response.raise_for_status()
        
        return response.content
    
    def get_municipality_data(self, municipality_code: str) -> Dict[str, Any]:
        """
        Get information about a municipality.
        
        Args:
            municipality_code: Norwegian municipality code (kommunenummer)
            
        Returns:
            Municipality data
        """
        return self._make_request(
            method="GET",
            endpoint=f"administrative/kommune/{municipality_code}"
        )
    
    def get_zoning_regulations(self, municipality_code: str, gnr: int, bnr: int) -> List[Dict[str, Any]]:
        """
        Get zoning regulations for a property.
        
        Note: This is mock data as actual zoning information requires
        integration with municipal databases.
        
        Args:
            municipality_code: Norwegian municipality code (kommunenummer)
            gnr: Property main number (gårdsnummer)
            bnr: Property sub-number (bruksnummer)
            
        Returns:
            List of zoning regulations
        """
        # In a real implementation, this would integrate with municipal databases
        # For now, we return mock data
        logger.warning("Using mock data for zoning regulations - this would require municipal data access")
        
        return [{
            "regulation_id": f"reg-{hash(f'{municipality_code}-{gnr}-{bnr}') % 1000}",
            "regulation_name": f"Reguleringsplan for eiendom {gnr}/{bnr}",
            "regulation_date": (datetime.now().replace(year=datetime.now().year - 3)).isoformat(),
            "land_use_categories": ["bolig"],
            "max_building_percentage": 40.0,
            "max_floors": 2,
            "max_height": 7.0,
            "min_plot_size": 800.0
        }]
    
    def search_properties(self, query: str, municipality_code: Optional[str] = None, 
                        limit: int = 10, offset: int = 0) -> Dict[str, Any]:
        """
        Search for properties by free text query.
        
        Args:
            query: Free text search query
            municipality_code: Optional municipality code to filter results
            limit: Maximum number of results to return
            offset: Number of results to skip
            
        Returns:
            Search results with property data
        """
        params = {
            "q": query,
            "limit": limit,
            "offset": offset
        }
        
        if municipality_code:
            params["kommunenr"] = municipality_code
        
        return self._make_request(
            method="GET",
            endpoint="matrikkel/sok",
            base_url_key="matrikkel_url",
            params=params
        )
    
    def geocode_address(self, address: str) -> Dict[str, Any]:
        """
        Convert an address to geographical coordinates.
        
        Args:
            address: Norwegian address string
            
        Returns:
            Geocoding results including coordinates
        """
        params = {"address": address}
        
        return self._make_request(
            method="GET",
            endpoint="geocode",
            params=params
        )
    
    def get_nearby_properties(self, latitude: float, longitude: float, 
                            radius: int = 500, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Find properties within a radius of a location.
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            radius: Search radius in meters
            limit: Maximum number of results
            
        Returns:
            List of properties near the specified location
        """
        params = {
            "lat": latitude,
            "lon": longitude,
            "radius": radius,
            "limit": limit
        }
        
        return self._make_request(
            method="GET",
            endpoint="matrikkel/naerliggende",
            base_url_key="matrikkel_url",
            params=params
        )
    
    def get_building_details(self, municipality_code: str, building_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a building.
        
        Args:
            municipality_code: Norwegian municipality code (kommunenummer)
            building_id: Building identifier from Matrikkelen
            
        Returns:
            Building details
        """
        return self._make_request(
            method="GET",
            endpoint=f"matrikkel/bygning/{municipality_code}/{building_id}",
            base_url_key="matrikkel_url"
        )

# Initialize the default API client
kartverket_api = KartverketAPI() 