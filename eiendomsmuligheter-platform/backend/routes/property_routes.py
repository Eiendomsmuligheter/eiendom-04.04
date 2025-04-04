"""
Property routes for the eiendomsmuligheter platform.
Handles property information, analysis, 3D visualization, etc.
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query, Body, File, UploadFile, Path
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, constr, validator
from datetime import datetime
import json
import os
import logging
import random
import shutil
from pathlib import Path as FilePath
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse

# Import Models
from models.property import PropertyBase, PropertyCreate, PropertyUpdate
from models.user import User

# Import AI modules
from ai_modules import AlterraML, PropertyData, CommuneConnect

# Import authentication
from routes.auth_routes import get_current_active_user

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/properties",
    tags=["properties"],
    responses={404: {"description": "Not found"}},
)

# Initialize AI modules
alterra_ml = AlterraML()
commune_connect = CommuneConnect()

# Mock Property Database
mock_properties = {
    "property1": {
        "id": "property1",
        "address": "Storgata 5, 0155 Oslo",
        "area": 2500.0,
        "coordinates": {"latitude": 59.9138, "longitude": 10.7387},
        "municipality_code": "0301",
        "land_use_category": {
            "name": "Bolig",
            "code": "1110",
        },
        "buildings": [
            {
                "id": "building1",
                "building_type": {
                    "name": "Leilighetsbygg",
                    "code": "113"
                },
                "year_built": 2020,
                "gross_area": 2200.0,
                "number_of_floors": 2,
                "number_of_units": 8
            }
        ],
        "zoning_info": {
            "status": {"name": "Regulert", "code": "R", "description": "Regulert område"},
            "purpose": "Boligformål",
            "regulations": [
                {
                    "id": "reg1",
                    "name": "Utnyttelsesgrad",
                    "value": "40%",
                    "description": "Maksimal utnyttelsesgrad"
                },
                {
                    "id": "reg2",
                    "name": "Byggehøyde",
                    "value": "12m",
                    "description": "Maksimal byggehøyde"
                }
            ]
        },
        "owner_info": {
            "name": "Oslo Eiendom AS",
            "contact": "kontakt@osloeiendom.no"
        },
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-03-17T12:00:00Z"
    }
}

# AI Module Singletons
alterra_ml = AlterraML()
commune_connect = CommuneConnect()

# Request and Response Models
class PropertyRequest(BaseModel):
    address: str
    area: float
    current_utilization: Optional[float] = 0.0
    municipality_code: Optional[str] = None
    building_type: Optional[str] = None
    building_height: Optional[float] = None
    year_built: Optional[int] = None
    
    @validator('municipality_code')
    def validate_municipality_code(cls, v):
        if v is not None and (not v.isdigit() or len(v) != 4):
            raise ValueError('Municipality code must be a 4-digit number')
        return v

class PropertyAnalysisResponse(BaseModel):
    property_id: str
    address: str
    analysis_date: str
    regulations: List[Dict[str, Any]]
    building_potential: Dict[str, Any]
    economic_potential: Dict[str, Any]
    energy_profile: Optional[Dict[str, Any]] = None
    risk_assessment: Dict[str, Any]
    recommendations: List[str]

class PropertyDetail(BaseModel):
    property_id: str
    address: str
    area: float
    coordinates: Dict[str, float]
    municipality_code: str
    land_use_category: Dict[str, str]
    buildings: List[Dict[str, Any]]
    zoning_info: Dict[str, Any]
    owner_info: Optional[Dict[str, str]] = None
    created_at: str
    updated_at: str

class PropertyList(BaseModel):
    properties: List[Dict[str, Any]]
    total: int
    page: int
    size: int

class PropertyRegulationInfo(BaseModel):
    property_id: str
    address: str
    regulations: Dict[str, Any]

class PropertyCreate(BaseModel):
    address: str
    area: float
    coordinates: Dict[str, float]
    municipality_code: str
    land_use_category: Dict[str, str]
    buildings: Optional[List[Dict[str, Any]]] = []
    zoning_info: Optional[Dict[str, Any]] = None
    owner_info: Optional[Dict[str, str]] = None

class PropertyUpdate(BaseModel):
    address: Optional[str] = None
    area: Optional[float] = None
    coordinates: Optional[Dict[str, float]] = None
    municipality_code: Optional[str] = None
    land_use_category: Optional[Dict[str, str]] = None
    buildings: Optional[List[Dict[str, Any]]] = None
    zoning_info: Optional[Dict[str, Any]] = None
    owner_info: Optional[Dict[str, str]] = None

class PropertySearchParams(BaseModel):
    address: Optional[str] = None
    municipality_code: Optional[str] = None
    min_area: Optional[float] = None
    max_area: Optional[float] = None
    land_use_category: Optional[str] = None
    building_type: Optional[str] = None

# Utility functions
def property_exists(property_id: str) -> bool:
    return property_id in mock_properties

# Routes
@router.get("/", response_model=PropertyList)
async def get_properties(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a list of properties with pagination.
    """
    start = (page - 1) * size
    end = start + size
    
    properties_list = list(mock_properties.values())
    
    # Sorting logic could be added here
    if sort_by:
        if sort_by == "area":
            properties_list.sort(key=lambda x: x["area"])
        elif sort_by == "date":
            properties_list.sort(key=lambda x: x["created_at"], reverse=True)
    
    paginated_properties = properties_list[start:end]
    
    return {
        "properties": paginated_properties,
        "total": len(properties_list),
        "page": page,
        "size": size
    }

@router.get("/{property_id}", response_model=PropertyDetail)
async def get_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed information about a specific property.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    return mock_properties[property_id]

@router.post("/", response_model=PropertyDetail, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new property.
    """
    property_id = f"property{len(mock_properties) + 1}"
    timestamp = datetime.now().isoformat()
    
    new_property = {
        "id": property_id,
        "address": property_data.address,
        "area": property_data.area,
        "coordinates": property_data.coordinates,
        "municipality_code": property_data.municipality_code,
        "land_use_category": property_data.land_use_category,
        "buildings": property_data.buildings or [],
        "zoning_info": property_data.zoning_info or {
            "status": {"name": "Ikke regulert", "code": "IR", "description": "Ikke regulert område"},
            "purpose": "Uregulert",
            "regulations": []
        },
        "owner_info": property_data.owner_info or {"name": "Ikke spesifisert", "contact": ""},
        "created_at": timestamp,
        "updated_at": timestamp
    }
    
    mock_properties[property_id] = new_property
    
    return new_property

@router.put("/{property_id}", response_model=PropertyDetail)
async def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing property.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    property_dict = mock_properties[property_id]
    
    # Update only the fields that are provided
    update_data = property_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            property_dict[key] = value
    
    property_dict["updated_at"] = datetime.now().isoformat()
    
    return property_dict

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a property.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    del mock_properties[property_id]
    
    return None

@router.post("/analyze", response_model=PropertyAnalysisResponse)
async def analyze_property(
    property_request: PropertyRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Analyze a property for development potential using AI.
    """
    # Convert request to PropertyData object for AlterraML
    property_data = PropertyData(
        address=property_request.address,
        lot_size=property_request.area,
        current_utilization=property_request.current_utilization or 0.1,
        municipality_id=property_request.municipality_code,
        building_height=property_request.building_height,
        floor_area_ratio=property_request.current_utilization if property_request.current_utilization else None
    )
    
    # Get analysis result from AlterraML
    analysis_result = alterra_ml.analyze_property(property_data)
    
    # Return formatted response
    return analysis_result

@router.get("/{property_id}/regulations", response_model=PropertyRegulationInfo)
async def get_property_regulations(
    property_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get zoning regulations and municipal plan information for a property.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    property_data = mock_properties[property_id]
    
    # Get regulations from CommuneConnect
    regulations = commune_connect.get_property_regulations(
        address=property_data["address"],
        municipality_id=property_data["municipality_code"]
    )
    
    return {
        "property_id": property_id,
        "address": property_data["address"],
        "regulations": regulations
    }

@router.post("/search", response_model=PropertyList)
async def search_properties(
    search_params: PropertySearchParams,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search for properties based on various criteria.
    """
    filtered_properties = list(mock_properties.values())
    
    # Apply filters based on search parameters
    if search_params.address:
        filtered_properties = [p for p in filtered_properties if search_params.address.lower() in p["address"].lower()]
    
    if search_params.municipality_code:
        filtered_properties = [p for p in filtered_properties if p["municipality_code"] == search_params.municipality_code]
    
    if search_params.min_area is not None:
        filtered_properties = [p for p in filtered_properties if p["area"] >= search_params.min_area]
    
    if search_params.max_area is not None:
        filtered_properties = [p for p in filtered_properties if p["area"] <= search_params.max_area]
    
    if search_params.land_use_category:
        filtered_properties = [p for p in filtered_properties if 
                            p["land_use_category"]["name"].lower() == search_params.land_use_category.lower() or
                            p["land_use_category"]["code"] == search_params.land_use_category]
    
    if search_params.building_type:
        filtered_properties = [p for p in filtered_properties if 
                            any(b["building_type"]["name"].lower() == search_params.building_type.lower() or
                                b["building_type"]["code"] == search_params.building_type
                                for b in p["buildings"])]
    
    # Paginate results
    start = (page - 1) * size
    end = start + size
    paginated_properties = filtered_properties[start:end]
    
    return {
        "properties": paginated_properties,
        "total": len(filtered_properties),
        "page": page,
        "size": size
    }

@router.get("/{property_id}/models", response_model=List[Dict[str, Any]])
async def get_property_models(
    property_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all 3D models for a property.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Return a list of available models
    return [
        {
            "model_id": "model1",
            "property_id": property_id,
            "name": "Standard 3D-modell",
            "description": "Standard 3D-modell av eiendommen",
            "created_at": "2024-03-17T12:00:00Z",
            "file_format": "json",
            "preview_url": f"/api/properties/{property_id}/models/model1/preview",
            "download_url": f"/api/properties/{property_id}/models/model1/download",
            "view_url": f"/api/properties/{property_id}/models/model1/view"
        }
    ]

@router.post("/{property_id}/models", response_model=Dict[str, Any])
async def generate_property_model(
    property_id: str,
    model_options: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate a new 3D model for a property.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    model_id = f"model_{random.randint(1000, 9999)}"
    
    # In a real implementation, this would trigger a background job to generate the model
    # For this demo, we'll return a mock response
    
    return {
        "property_id": property_id,
        "model_id": model_id,
        "status": "processing",
        "created_at": datetime.now().isoformat(),
        "estimated_completion_time": (datetime.now() + datetime.timedelta(minutes=5)).isoformat(),
        "options": model_options
    }

@router.get("/{property_id}/models/{model_id}")
async def get_property_model(
    property_id: str,
    model_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get information about a specific 3D model.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    # In a real implementation, this would check if the model exists
    # For this demo, we'll return a mock response
    
    return {
        "property_id": property_id,
        "model_id": model_id,
        "status": "completed",
        "created_at": (datetime.now() - datetime.timedelta(minutes=5)).isoformat(),
        "file_format": "json",
        "file_size": 12500000,  # bytes
        "preview_url": f"/api/properties/{property_id}/models/{model_id}/preview",
        "download_url": f"/api/properties/{property_id}/models/{model_id}/download",
        "view_url": f"/api/properties/{property_id}/models/{model_id}/view"
    }

@router.get("/{property_id}/models/{model_id}/view")
async def view_3d_model(
    property_id: str,
    model_id: str,
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """
    View a 3D model in the browser.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    # In a real implementation, this would return HTML or redirect to a viewer
    # For this demo, we'll return a mock HTML content
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>3D Model Viewer - Property {property_id}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/three@0.132.0/build/three.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.132.0/examples/js/controls/OrbitControls.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.132.0/examples/js/loaders/GLTFLoader.js"></script>
        <style>
            body {{ margin: 0; overflow: hidden; }}
            #info {{ position: absolute; top: 10px; width: 100%; text-align: center; color: white; }}
        </style>
    </head>
    <body>
        <div id="info">Property {property_id} - 3D Model Viewer</div>
        <script>
            // Three.js viewer implementation would go here
            console.log("Loading 3D model for property {property_id}, model {model_id}");
        </script>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content, status_code=200)

@router.get("/{property_id}/models/{model_id}/download")
async def download_3d_model(
    property_id: str,
    model_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Download a 3D model file.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    # In a real implementation, this would check if the model exists and return the file
    # For this demo, we'll redirect to a static file
    
    # Check if the file exists in the public directory
    model_path = f"../frontend/public/models/properties/{property_id}.json"
    if os.path.exists(model_path):
        return FileResponse(model_path, filename=f"{property_id}_3d_model.json")
    else:
        raise HTTPException(status_code=404, detail="Model file not found")

@router.get("/{property_id}/models/{model_id}/preview")
async def preview_3d_model(
    property_id: str,
    model_id: str,
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """
    Get a preview image of a 3D model.
    """
    if not property_exists(property_id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    # In a real implementation, this would return a preview image
    # For this demo, we'll redirect to a static image
    
    return FileResponse("../frontend/public/images/property-hero.jpg", media_type="image/jpeg")

@router.get("/{property_id}/rental-potential", response_model=Dict[str, Any])
async def analyze_rental_potential(
    property_id: str = Path(..., description="Eiendom-ID for å analysere utleiepotensial"),
    budget: Optional[float] = Query(None, description="Maksimalt budsjett for ombygging"),
    include_3d: bool = Query(False, description="Inkluder 3D-visualisering av foreslått løsning"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Analyser mulighetene for å etablere en utleiedel i en eksisterende bolig
    uten større byggearbeid, kun ved å endre planløsning.
    
    Denne analysen fokuserer på kostnadseffektive løsninger som gir god
    avkastning gjennom utleieinntekter med minimal investering.
    
    Eksempelløsninger inkluderer:
    - Dele stuen for å skape en hybel
    - Konvertere kjeller eller loftsetasje til separat utleiedel
    - Konvertere rom i tilknytning til bad til hybel
    
    For hver løsning gis detaljert informasjon om:
    - Estimert kostnad og tidsramme
    - Forventet utleieinntekt
    - ROI-beregning og nedbetalingstid
    - Materialkostnader og arbeidskostnader
    - Juridiske krav og nødvendige tillatelser
    """
    try:
        if property_id not in mock_properties:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Eiendom ikke funnet"
            )
        
        # Hent eiendomsdata
        property_data = mock_properties[property_id]
        
        # Initialiser FloorPlanAnalyzer
        floor_plan_analyzer = FloorPlanAnalyzer()
        
        # Samle nødvendig informasjon for analyse
        floor_plans = property_data.get("floor_plans", [])
        property_size = property_data.get("area", 120.0)  # Default til 120kvm hvis mangler
        building_type = property_data.get("building_type", "residential")
        number_of_floors = len(property_data.get("floors", []))
        if number_of_floors == 0:
            number_of_floors = 1  # Default til 1 etasje hvis mangler
            
        # Utfør plantegningsanalyse
        floor_plan_analysis = await floor_plan_analyzer.analyze(
            floor_plans=floor_plans,
            building_type=building_type,
            property_size=property_size,
            number_of_floors=number_of_floors
        )
        
        # Generer detaljert renoveringsplan basert på budsjett
        renovation_plan = None
        if floor_plan_analysis.get("rental_potential", {}).get("has_potential", False):
            renovation_plan = floor_plan_analyzer.generate_renovation_plan(
                floor_plan_analysis=floor_plan_analysis,
                budget=budget
            )
            
        # Generer 3D-visualisering hvis forespurt
        visualization_url = None
        if include_3d and renovation_plan and renovation_plan.get("title") != "Ingen løsninger innenfor budsjett":
            try:
                modeling_service = get_3d_modeling_service()
                visualization = await modeling_service.visualize_renovation(
                    property_id=property_id,
                    renovation_plan=renovation_plan,
                    floor_plan_data=floor_plan_analysis
                )
                visualization_url = visualization.get("model_url")
        except Exception as e:
                logger.error(f"Feil ved generering av 3D-visualisering: {str(e)}")
        
        # Bygg responsen
        response = {
            "property_id": property_id,
            "address": property_data.get("address", ""),
            "analysis_date": datetime.now().isoformat(),
            "floor_plan_analysis": {
                "total_area": floor_plan_analysis.get("total_area", 0),
                "layout_efficiency": floor_plan_analysis.get("layout_efficiency", 0),
                "rooms_summary": self._summarize_rooms(floor_plan_analysis.get("rooms_detected", {}))
            },
            "rental_potential": floor_plan_analysis.get("rental_potential", {
                "has_potential": False,
                "suggested_solutions": []
            }),
            "renovation_plan": renovation_plan,
            "visualization_url": visualization_url
        }
        
        return response
        
    except Exception as e:
        logger.error(f"Feil under analyse av utleiepotensial: {str(e)}")
        logger.debug(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"En feil oppstod under analyseprosessen: {str(e)}"
        )

def _summarize_rooms(self, rooms_detected):
    """Opprett en oppsummering av rommene for enklere visning."""
    room_types = {}
    total_area = 0
    
    for name, data in rooms_detected.items():
        room_type = next((t for t in ["livingroom", "kitchen", "bathroom", "bedroom", "hallway"] if t in name.lower()), "other")
        area = data.get("area", 0)
        
        if room_type in room_types:
            room_types[room_type]["count"] += 1
            room_types[room_type]["total_area"] += area
        else:
            room_types[room_type] = {
                "count": 1,
                "total_area": area
            }
        
        total_area += area
    
    return {
        "room_distribution": room_types,
        "total_area": total_area
    } 