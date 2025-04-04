"""
Property models for the Eiendomsmuligheter Platform API.

This module provides comprehensive data models for property representation including:
- Base property data
- Detailed property information
- Land use categories
- Building information
- Zoning regulations
- Geographical features
"""
from pydantic import BaseModel, Field, validator, root_validator
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from enum import Enum
import uuid
import re

class Coordinates(BaseModel):
    """Geographical coordinates in different formats"""
    latitude: float
    longitude: float
    utm_zone: Optional[str] = None
    utm_easting: Optional[float] = None
    utm_northing: Optional[float] = None
    
    class Config:
        schema_extra = {
            "example": {
                "latitude": 59.9139,
                "longitude": 10.7522,
                "utm_zone": "32V",
                "utm_easting": 597456.7,
                "utm_northing": 6643812.5
            }
        }

class Address(BaseModel):
    """Detailed address information"""
    street: str
    house_number: str
    postal_code: str
    city: str
    municipality: str
    county: str
    country: str = "Norge"
    
    class Config:
        schema_extra = {
            "example": {
                "street": "Storgata",
                "house_number": "1",
                "postal_code": "0155",
                "city": "Oslo",
                "municipality": "Oslo",
                "county": "Oslo",
                "country": "Norge"
            }
        }

class LandUseCategory(str, Enum):
    """Land use categories according to Norwegian regulations"""
    RESIDENTIAL = "bolig"
    COMMERCIAL = "næring"
    INDUSTRIAL = "industri"
    AGRICULTURAL = "landbruk"
    RECREATIONAL = "fritid"
    PUBLIC = "offentlig"
    COMBINED = "kombinert"
    OTHER = "annet"

class BuildingType(str, Enum):
    """Building types according to Norwegian regulations"""
    DETACHED_HOUSE = "enebolig"
    SEMI_DETACHED = "tomannsbolig"
    TOWNHOUSE = "rekkehus"
    APARTMENT_BUILDING = "leilighetsbygg"
    CABIN = "hytte"
    COMMERCIAL_BUILDING = "næringsbygg"
    INDUSTRIAL_BUILDING = "industribygg"
    AGRICULTURAL_BUILDING = "landbruksbygg"
    PUBLIC_BUILDING = "offentlig_bygg"
    OTHER = "annet"

class ZoningStatus(str, Enum):
    """Current zoning status of a property"""
    ZONED = "regulert"
    UNZONED = "uregulert"
    ZONING_IN_PROGRESS = "regulering_pågår"
    PARTIALLY_ZONED = "delvis_regulert"

class BuildingStatus(str, Enum):
    """Current status of buildings on the property"""
    EXISTING = "eksisterende"
    UNDER_CONSTRUCTION = "under_oppføring"
    PLANNED = "planlagt"
    DEMOLISHED = "revet"
    NO_BUILDINGS = "ingen_bygninger"

class Building(BaseModel):
    """Detailed information about a building on the property"""
    id: str
    building_type: BuildingType
    year_built: Optional[int] = None
    gross_area: Optional[float] = None  # BRA (Bruksareal) in m²
    usable_area: Optional[float] = None  # BTA (Bruttoareal) in m²
    number_of_floors: Optional[int] = None
    number_of_units: Optional[int] = None
    building_materials: Optional[List[str]] = None
    energy_rating: Optional[str] = None
    status: BuildingStatus = BuildingStatus.EXISTING
    coordinates: Optional[Coordinates] = None
    description: Optional[str] = None
    last_renovated: Optional[int] = None
    technical_condition: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "id": "building-123",
                "building_type": "enebolig",
                "year_built": 1985,
                "gross_area": 150.5,
                "usable_area": 120.0,
                "number_of_floors": 2,
                "number_of_units": 1,
                "building_materials": ["tre", "betong"],
                "energy_rating": "C",
                "status": "eksisterende",
                "coordinates": {
                    "latitude": 59.9139,
                    "longitude": 10.7522
                },
                "description": "Enebolig med god standard",
                "last_renovated": 2010,
                "technical_condition": "god"
            }
        }

class ZoningRegulation(BaseModel):
    """Zoning regulations for the property"""
    regulation_id: str
    regulation_name: str
    regulation_date: datetime
    land_use_categories: List[LandUseCategory]
    max_building_percentage: Optional[float] = None  # BYA (Bebygd areal) in %
    max_floors: Optional[int] = None
    max_height: Optional[float] = None  # in meters
    min_plot_size: Optional[float] = None  # in m²
    special_considerations: Optional[List[str]] = None
    limitations: Optional[List[str]] = None
    document_url: Optional[str] = None
    map_url: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "regulation_id": "reg-123",
                "regulation_name": "Reguleringsplan for Storgata",
                "regulation_date": "2015-03-15T00:00:00Z",
                "land_use_categories": ["bolig", "næring"],
                "max_building_percentage": 40.0,
                "max_floors": 4,
                "max_height": 12.5,
                "min_plot_size": 600.0,
                "special_considerations": ["kulturminne", "flomfare"],
                "limitations": ["byggegrense mot vei: 4m"],
                "document_url": "https://kommune.no/regulering/123",
                "map_url": "https://kommune.no/kart/123"
            }
        }

class PropertyBase(BaseModel):
    """Base information for a property"""
    property_id: str = Field(..., description="Unique property identifier")
    municipality_code: str = Field(..., description="Norwegian municipality code")
    gnr: int = Field(..., description="Property main number (gårdsnummer)")
    bnr: int = Field(..., description="Property sub-number (bruksnummer)")
    fnr: Optional[int] = Field(None, description="Leasehold number (festenummer)")
    snr: Optional[int] = Field(None, description="Section number (seksjonsnummer)")
    
    @validator('municipality_code')
    def validate_municipality_code(cls, v):
        """Validate that municipality code is in correct format (4 digits)"""
        if not re.match(r'^\d{4}$', v):
            raise ValueError('Municipality code must be 4 digits')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "property_id": "property-123",
                "municipality_code": "0301",
                "gnr": 1,
                "bnr": 1,
                "fnr": None,
                "snr": None
            }
        }

class PropertyCreate(PropertyBase):
    """Model for creating a new property record"""
    address: Address
    area: float = Field(..., description="Property area in square meters")
    coordinates: Coordinates
    land_use_category: LandUseCategory = LandUseCategory.RESIDENTIAL
    
    class Config:
        schema_extra = {
            "example": {
                "property_id": "property-123",
                "municipality_code": "0301",
                "gnr": 1,
                "bnr": 1,
                "fnr": None,
                "snr": None,
                "address": {
                    "street": "Storgata",
                    "house_number": "1",
                    "postal_code": "0155",
                    "city": "Oslo",
                    "municipality": "Oslo",
                    "county": "Oslo",
                    "country": "Norge"
                },
                "area": 1000.0,
                "coordinates": {
                    "latitude": 59.9139,
                    "longitude": 10.7522
                },
                "land_use_category": "bolig"
            }
        }

class PropertyUpdate(BaseModel):
    """Model for updating property information"""
    address: Optional[Address] = None
    area: Optional[float] = None
    coordinates: Optional[Coordinates] = None
    land_use_category: Optional[LandUseCategory] = None
    buildings: Optional[List[Building]] = None
    zoning_status: Optional[ZoningStatus] = None
    zoning_regulations: Optional[List[ZoningRegulation]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "area": 1200.0,
                "land_use_category": "kombinert",
                "zoning_status": "regulert"
            }
        }

class PropertyOwner(BaseModel):
    """Property owner information"""
    owner_id: str
    owner_type: str  # person, company, public
    owner_name: str
    ownership_percentage: float
    acquisition_date: Optional[datetime] = None
    
    @validator('ownership_percentage')
    def validate_percentage(cls, v):
        """Validate that ownership percentage is between 0 and 100"""
        if v < 0 or v > 100:
            raise ValueError('Ownership percentage must be between 0 and 100')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "owner_id": "owner-123",
                "owner_type": "person",
                "owner_name": "Ola Nordmann",
                "ownership_percentage": 100.0,
                "acquisition_date": "2010-01-01T00:00:00Z"
            }
        }

class PropertyValueAssessment(BaseModel):
    """Property value assessment information"""
    assessment_id: str
    assessment_date: datetime
    market_value: float
    tax_value: Optional[float] = None
    assessment_method: str
    assessor_id: Optional[str] = None
    assessor_name: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "assessment_id": "assessment-123",
                "assessment_date": "2023-01-01T00:00:00Z",
                "market_value": 5000000.0,
                "tax_value": 4500000.0,
                "assessment_method": "sammenlignbare_eiendommer",
                "assessor_id": "user-456",
                "assessor_name": "Eiendomsverdi AS"
            }
        }

class Encumbrance(BaseModel):
    """Legal encumbrances on the property"""
    encumbrance_id: str
    encumbrance_type: str  # mortgage, easement, lease, etc.
    description: str
    registered_date: datetime
    amount: Optional[float] = None  # for mortgages
    beneficiary: Optional[str] = None
    document_url: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "encumbrance_id": "encumbrance-123",
                "encumbrance_type": "mortgage",
                "description": "Mortgage to Bank",
                "registered_date": "2015-01-01T00:00:00Z",
                "amount": 2000000.0,
                "beneficiary": "Bank of Norway",
                "document_url": "https://example.com/document.pdf"
            }
        }

class PropertyTransaction(BaseModel):
    """Historical transaction data for the property"""
    transaction_id: str
    transaction_date: datetime
    transaction_type: str  # sale, inheritance, gift, etc.
    price: Optional[float] = None
    buyer_id: Optional[str] = None
    buyer_name: Optional[str] = None
    seller_id: Optional[str] = None
    seller_name: Optional[str] = None
    document_url: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "transaction_id": "transaction-123",
                "transaction_date": "2010-01-01T00:00:00Z",
                "transaction_type": "sale",
                "price": 4200000.0,
                "buyer_name": "Ola Nordmann",
                "seller_name": "Kari Nordmann",
                "document_url": "https://example.com/document.pdf"
            }
        }

class DevelopmentPotential(BaseModel):
    """Analysis of development potential for the property"""
    potential_id: str
    analysis_date: datetime
    potential_category: str  # extension, densification, conversion, etc.
    description: str
    potential_area_increase: Optional[float] = None  # in m²
    potential_value_increase: Optional[float] = None  # in NOK
    probability: Optional[float] = None  # 0-100%
    estimated_cost: Optional[float] = None  # in NOK
    roi: Optional[float] = None  # return on investment %
    constraints: Optional[List[str]] = None
    opportunities: Optional[List[str]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "potential_id": "potential-123",
                "analysis_date": "2023-01-15T00:00:00Z",
                "potential_category": "densification",
                "description": "Mulighet for oppføring av flere boenheter",
                "potential_area_increase": 120.0,
                "potential_value_increase": 3000000.0,
                "probability": 70.0,
                "estimated_cost": 2000000.0,
                "roi": 50.0,
                "constraints": ["reguleringsbestemmelser", "parkeringskrav"],
                "opportunities": ["økende boligpriser i området", "god kollektivdekning"]
            }
        }

class Property(PropertyBase):
    """Complete property model with all fields"""
    address: Address
    area: float
    coordinates: Coordinates
    land_use_category: LandUseCategory
    buildings: List[Building] = Field(default_factory=list)
    zoning_status: ZoningStatus = ZoningStatus.UNZONED
    zoning_regulations: List[ZoningRegulation] = Field(default_factory=list)
    owners: List[PropertyOwner] = Field(default_factory=list)
    value_assessments: List[PropertyValueAssessment] = Field(default_factory=list)
    encumbrances: List[Encumbrance] = Field(default_factory=list)
    transactions: List[PropertyTransaction] = Field(default_factory=list)
    development_potentials: List[DevelopmentPotential] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    images: List[str] = Field(default_factory=list)
    documents: List[Dict[str, str]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @root_validator(skip_on_failure=True)
    def validate_owners_percentage(cls, values):
        """Validate that sum of ownership percentages is 100%"""
        owners = values.get('owners', [])
        if owners and sum(o.ownership_percentage for o in owners) != 100:
            raise ValueError('Sum of ownership percentages must be 100%')
        return values
    
    class Config:
        schema_extra = {
            "example": {
                "property_id": "property-123",
                "municipality_code": "0301",
                "gnr": 1,
                "bnr": 1,
                "fnr": None,
                "snr": None,
                "address": {
                    "street": "Storgata",
                    "house_number": "1",
                    "postal_code": "0155",
                    "city": "Oslo",
                    "municipality": "Oslo",
                    "county": "Oslo",
                    "country": "Norge"
                },
                "area": 1000.0,
                "coordinates": {
                    "latitude": 59.9139,
                    "longitude": 10.7522
                },
                "land_use_category": "bolig",
                "buildings": [
                    {
                        "id": "building-123",
                        "building_type": "enebolig",
                        "year_built": 1985,
                        "gross_area": 150.5,
                        "usable_area": 120.0,
                        "number_of_floors": 2,
                        "number_of_units": 1,
                        "status": "eksisterende"
                    }
                ],
                "zoning_status": "regulert",
                "zoning_regulations": [
                    {
                        "regulation_id": "reg-123",
                        "regulation_name": "Reguleringsplan for Storgata",
                        "regulation_date": "2015-03-15T00:00:00Z",
                        "land_use_categories": ["bolig"],
                        "max_building_percentage": 40.0,
                        "max_floors": 2
                    }
                ],
                "owners": [
                    {
                        "owner_id": "owner-123",
                        "owner_type": "person",
                        "owner_name": "Ola Nordmann",
                        "ownership_percentage": 100.0,
                        "acquisition_date": "2010-01-01T00:00:00Z"
                    }
                ],
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-15T00:00:00Z"
            }
        }

def generate_property_id() -> str:
    """Generate a unique property ID"""
    return f"property-{uuid.uuid4().hex[:8]}"

def generate_building_id() -> str:
    """Generate a unique building ID"""
    return f"building-{uuid.uuid4().hex[:8]}" 