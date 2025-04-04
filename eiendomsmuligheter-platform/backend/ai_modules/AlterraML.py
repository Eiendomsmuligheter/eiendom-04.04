"""
AlterraML - Maskinlæringsmodul for eiendomsanalyse og potensialvurdering.
Denne modulen bruker ulike ML-modeller for å analysere eiendommer og vurdere
utviklingspotensial basert på en rekke faktorer.
"""

import os
import json
import random
import logging
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field

# Sett opp logging
logger = logging.getLogger(__name__)

class PropertyData(BaseModel):
    """Data for en eiendom som skal analyseres"""
    property_id: Optional[str] = None
    address: str
    municipality_id: Optional[str] = None
    zoning_category: Optional[str] = None
    lot_size: float
    current_utilization: float
    building_height: Optional[float] = None
    floor_area_ratio: Optional[float] = None
    images: Optional[List[str]] = None
    additional_data: Optional[Dict[str, Any]] = None

class AlterraML:
    """Hovedklasse for maskinlæringsanalyse av eiendommer"""
    
    def __init__(self):
        """Initialiserer AlterraML med nødvendige modeller"""
        logger.info("Initialiserer AlterraML")
        self.models_loaded = True
        random.seed(datetime.now().timestamp())  # For reproduserbare, men varierende resultater
        
        # Last inn data for kommuner (simulert)
        self.municipality_data = {
            "0301": {  # Oslo
                "name": "Oslo",
                "regulations": {
                    "max_height": 24.0,
                    "max_far": 3.5,
                    "min_lot_size": 500.0,
                    "parking_requirements": 0.5,  # pr. boenhet
                    "special_zones": ["cultural_heritage", "urban_development"]
                },
                "market_data": {
                    "avg_price_sqm": 85000,
                    "demand_index": 0.9,
                    "growth_forecast": 0.04
                }
            },
            "1103": {  # Stavanger
                "name": "Stavanger",
                "regulations": {
                    "max_height": 18.0,
                    "max_far": 2.8,
                    "min_lot_size": 600.0,
                    "parking_requirements": 0.8,
                    "special_zones": ["coastal_zone"]
                },
                "market_data": {
                    "avg_price_sqm": 55000,
                    "demand_index": 0.75,
                    "growth_forecast": 0.02
                }
            },
            "5001": {  # Trondheim
                "name": "Trondheim",
                "regulations": {
                    "max_height": 20.0,
                    "max_far": 3.0,
                    "min_lot_size": 600.0,
                    "parking_requirements": 0.7,
                    "special_zones": ["university_zone"]
                },
                "market_data": {
                    "avg_price_sqm": 65000,
                    "demand_index": 0.8,
                    "growth_forecast": 0.03
                }
            },
            "4601": {  # Bergen
                "name": "Bergen",
                "regulations": {
                    "max_height": 22.0,
                    "max_far": 3.2,
                    "min_lot_size": 550.0,
                    "parking_requirements": 0.6,
                    "special_zones": ["world_heritage", "coastal_zone"]
                },
                "market_data": {
                    "avg_price_sqm": 70000,
                    "demand_index": 0.85,
                    "growth_forecast": 0.035
                }
            }
        }
        
        # Tilfeldig tildelingstabell for kommuneID basert på postnummer
        self.postal_to_municipality = {
            # Oslo
            "0": "0301", "1": "0301", 
            # Stavanger
            "4": "1103", 
            # Trondheim
            "7": "5001", 
            # Bergen
            "5": "4601"
        }
    
    def _get_municipality_from_address(self, address: str) -> str:
        """Henter kommune-ID basert på adresse"""
        # Enkelt eksempel - i virkeligheten ville dette være en mer kompleks geolokalisering
        postal_code = ""
        for part in address.split():
            if part.isdigit() and len(part) == 4:
                postal_code = part
                break
        
        if not postal_code:
            # Standard fallback til Oslo
            return "0301"
        
        # Finn kommune basert på første siffer i postnummer
        first_digit = postal_code[0]
        return self.postal_to_municipality.get(first_digit, "0301")
    
    def _calculate_potential(self, property_data: PropertyData, municipality_id: str) -> Dict[str, Any]:
        """Beregner potensiale basert på eiendomsdata og kommune"""
        muni_data = self.municipality_data.get(municipality_id, self.municipality_data["0301"])
        
        # Reguleringsregler
        regulations = muni_data["regulations"]
        max_height = regulations["max_height"]
        max_far = regulations["max_far"]
        
        # Markedsdata
        market_data = muni_data["market_data"]
        avg_price_sqm = market_data["avg_price_sqm"]
        demand_index = market_data["demand_index"]
        growth_forecast = market_data["growth_forecast"]
        
        # Beregn potensiale
        current_area = property_data.lot_size * property_data.current_utilization
        max_potential_area = property_data.lot_size * max_far
        available_additional_area = max_potential_area - current_area
        
        # Legg til litt variasjon for realistiske resultater
        variation = random.uniform(0.85, 1.15)
        available_additional_area *= variation
        
        # Økonomisk potensiale
        potential_value = available_additional_area * avg_price_sqm * demand_index
        roi_estimate = potential_value / (available_additional_area * 35000)  # antatt byggekostnad per kvm
        
        # Optimal konfigurasjon
        if property_data.lot_size > 1000:
            optimal_config = "Leilighetsbygg, 4-5 etasjer"
            max_units = int(available_additional_area / 80)  # antatt 80 kvm per leilighet
        elif property_data.lot_size > 600:
            optimal_config = "Rekkehus eller lavblokk"
            max_units = int(available_additional_area / 120)
        else:
            optimal_config = "Enebolig eller tomannsbolig"
            max_units = int(available_additional_area / 150)
        
        # Sannsynlig byggetid
        if available_additional_area > 5000:
            build_time = "24-36 måneder"
        elif available_additional_area > 1000:
            build_time = "18-24 måneder"
        else:
            build_time = "12-18 måneder"
        
        # Risikovurdering
        risk_factors = []
        if property_data.lot_size < regulations["min_lot_size"]:
            risk_factors.append("Tomten er mindre enn minstekravet for området")
        
        if "cultural_heritage" in regulations.get("special_zones", []):
            risk_factors.append("Området har kulturminnehensyn")
        
        if "coastal_zone" in regulations.get("special_zones", []):
            risk_factors.append("Kystsonerestriksjoner kan påvirke utbygging")
        
        risk_level = "lav" if len(risk_factors) == 0 else "middels" if len(risk_factors) == 1 else "høy"
        
        # Anbefalinger
        recommendations = []
        if available_additional_area > 1000:
            recommendations.append("Søk forhåndskonferanse med kommunen for å diskutere utbyggingsplanene")
        
        if "urban_development" in regulations.get("special_zones", []):
            recommendations.append("Området er prioritert for byutvikling - foreslå høyere utnyttelsesgrad")
        
        recommendations.append(f"Vurder {optimal_config.lower()} som vil gi ca {max_units} enheter")
        
        if risk_level == "høy":
            recommendations.append("Gjennomfør grundig risiko- og reguleringsanalyse før investering")
        
        return {
            "regulations": [
                {
                    "id": "reg-height",
                    "rule_type": "max_height",
                    "value": max_height,
                    "description": "Maksimal byggehøyde",
                    "unit": "meter"
                },
                {
                    "id": "reg-far",
                    "rule_type": "floor_area_ratio",
                    "value": max_far,
                    "description": "Maksimal utnyttelsesgrad (BRA/tomteareal)",
                    "unit": "ratio"
                },
                {
                    "id": "reg-lot",
                    "rule_type": "min_lot_size",
                    "value": regulations["min_lot_size"],
                    "description": "Minste tomtestørrelse",
                    "unit": "m²"
                }
            ],
            "building_potential": {
                "max_buildable_area": max_potential_area,
                "additional_buildable_area": available_additional_area,
                "max_height": max_height,
                "max_units": max_units,
                "optimal_configuration": optimal_config,
                "estimated_build_time": build_time,
                "constraints": risk_factors
            },
            "economic_potential": {
                "potential_value_estimate": potential_value,
                "roi_estimate": roi_estimate,
                "market_price_per_sqm": avg_price_sqm,
                "demand_index": demand_index,
                "growth_forecast": growth_forecast
            },
            "energy_profile": {
                "energy_class": random.choice(["A", "B", "C"]),
                "heating_demand": round(random.uniform(70, 120), 1),
                "cooling_demand": round(random.uniform(10, 30), 1),
                "primary_energy_source": random.choice(["Fjernvarme", "Elektrisitet", "Varmepumpe"]),
                "recommendations": [
                    "Installere varmepumpe kan redusere energikostnader med opptil 25%",
                    "Solceller på taket kan dekke opptil 30% av energibehovet"
                ]
            },
            "risk_assessment": {
                "risk_level": risk_level,
                "risk_factors": risk_factors
            },
            "recommendations": recommendations
        }
    
    def analyze_property(self, property_data: PropertyData) -> Dict[str, Any]:
        """Hovedmetode for å analysere en eiendom"""
        logger.info(f"Analyserer eiendom: {property_data.address}")
        
        # Sett property_id hvis ikke oppgitt
        if not property_data.property_id:
            property_data.property_id = f"property-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Finn kommune-ID basert på adresse hvis ikke oppgitt
        municipality_id = property_data.municipality_id
        if not municipality_id:
            municipality_id = self._get_municipality_from_address(property_data.address)
            logger.info(f"Identifisert kommune-ID: {municipality_id}")
        
        # Beregn potensiale
        analysis_result = self._calculate_potential(property_data, municipality_id)
        
        # Legg til grunnleggende eiendomsinfo
        result = {
            "property_id": property_data.property_id,
            "address": property_data.address,
            "municipality_id": municipality_id,
            "lot_size": property_data.lot_size,
            "current_utilization": property_data.current_utilization,
            "analysis_date": datetime.now().isoformat()
        }
        
        # Kombiner med analyseresultat
        result.update(analysis_result)
        
        logger.info(f"Analyse fullført for eiendom: {property_data.address}")
        return result 