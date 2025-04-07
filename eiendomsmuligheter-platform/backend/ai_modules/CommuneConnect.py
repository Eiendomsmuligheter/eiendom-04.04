"""
CommuneConnect - Module for accessing and interpreting municipal information and regulations in Norway.
This module connects to municipal APIs and datasets to retrieve updated information about
building regulations, zoning plans, property boundaries, municipal plans, and other relevant information.
"""

import os
import json
import requests
import random
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CommuneConnect:
    """
    Main class for accessing and interpreting municipal information and regulations in Norway.
    Provides functionality for retrieving building regulations, zoning plans, and application processes.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the CommuneConnect module.
        
        Args:
            config_path: Path to configuration file with API keys and endpoints
        """
        logger.info("Initializing CommuneConnect")
        self.config = self._load_config(config_path)
        self.regulations_cache = {}
        self.api_key = self.config.get('api_key', '')
        self.api_base_url = self.config.get('api_base_url', '')
        self.api_ready = True
        
        # Load local regulations database
        self.regulations_db = self._load_regulations_db()
        
        # Initialize municipal plans data
        self._init_municipal_plans()
        
        # Initialize zoning plans data
        self._init_zoning_plans()
        
        # Initialize building application processes
        self._init_building_processes()
        
        logger.info("CommuneConnect module initialized")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """
        Load configuration from file or use defaults.
        
        Args:
            config_path: Path to configuration file
            
        Returns:
            Configuration dictionary
        """
        default_config = {
            'api_key': '',
            'api_base_url': 'https://api.kommunedata.no/v1',
            'cache_dir': '/tmp/commune_connect_cache',
            'regulations_db_path': os.path.join(os.path.dirname(__file__), 'data/regulations.json')
        }
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    # Merge with defaults
                    for key, value in default_config.items():
                        if key not in config:
                            config[key] = value
                return config
            except Exception as e:
                logger.error(f"Error loading config from {config_path}: {e}")
                return default_config
        else:
            logger.info("Using default configuration")
            return default_config
    
    def _load_regulations_db(self) -> Dict[str, Any]:
        """
        Load the local regulations database.
        
        Returns:
            Regulations database
        """
        db_path = self.config.get('regulations_db_path')
        
        if db_path and os.path.exists(db_path):
            try:
                with open(db_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading regulations database: {e}")
        
        # If loading fails or file doesn't exist, return default database
        return self._get_default_regulations_db()
    
    def _get_default_regulations_db(self) -> Dict[str, Any]:
        """
        Get default regulations database.
        
        Returns:
            Default regulations database
        """
        return {
            'municipalities': {
                'oslo': {
                    'name': 'Oslo',
                    'municipality_id': '0301',
                    'regulations': {
                        'rental_unit': {
                            'min_area': 25,
                            'min_ceiling_height': 2.2,
                            'separate_entrance': True,
                            'bathroom_required': True,
                            'kitchen_required': True,
                            'fire_safety': {
                                'smoke_detector': True,
                                'fire_extinguisher': True,
                                'escape_route': True
                            },
                            'ventilation': {
                                'bathroom': 'mechanical',
                                'kitchen': 'mechanical'
                            },
                            'sound_insulation': {
                                'walls': 'R\'w ≥ 55 dB',
                                'floors': 'L\'n,w ≤ 53 dB'
                            },
                            'electrical': {
                                'separate_circuit': True,
                                'grounded_outlets': True
                            },
                            'application_process': {
                                'permit_required': True,
                                'documentation_required': [
                                    'Floor plans (before and after)',
                                    'Technical drawings',
                                    'Fire safety documentation',
                                    'Sound insulation documentation'
                                ],
                                'estimated_processing_time': '8-12 weeks',
                                'fee': 'NOK 5,000 - 15,000'
                            }
                        }
                    }
                },
                'bergen': {
                    'name': 'Bergen',
                    'municipality_id': '4601',
                    'regulations': {
                        'rental_unit': {
                            'min_area': 25,
                            'min_ceiling_height': 2.2,
                            'separate_entrance': True,
                            'bathroom_required': True,
                            'kitchen_required': True,
                            'fire_safety': {
                                'smoke_detector': True,
                                'fire_extinguisher': True,
                                'escape_route': True
                            },
                            'ventilation': {
                                'bathroom': 'mechanical',
                                'kitchen': 'mechanical'
                            },
                            'sound_insulation': {
                                'walls': 'R\'w ≥ 55 dB',
                                'floors': 'L\'n,w ≤ 53 dB'
                            },
                            'electrical': {
                                'separate_circuit': True,
                                'grounded_outlets': True
                            },
                            'application_process': {
                                'permit_required': True,
                                'documentation_required': [
                                    'Floor plans (before and after)',
                                    'Technical drawings',
                                    'Fire safety documentation',
                                    'Sound insulation documentation'
                                ],
                                'estimated_processing_time': '6-10 weeks',
                                'fee': 'NOK 4,500 - 12,000'
                            }
                        }
                    }
                },
                'trondheim': {
                    'name': 'Trondheim',
                    'municipality_id': '5001',
                    'regulations': {
                        'rental_unit': {
                            'min_area': 25,
                            'min_ceiling_height': 2.4,
                            'separate_entrance': True,
                            'bathroom_required': True,
                            'kitchen_required': True,
                            'fire_safety': {
                                'smoke_detector': True,
                                'fire_extinguisher': True,
                                'escape_route': True
                            },
                            'ventilation': {
                                'bathroom': 'mechanical',
                                'kitchen': 'mechanical'
                            },
                            'sound_insulation': {
                                'walls': 'R\'w ≥ 55 dB',
                                'floors': 'L\'n,w ≤ 53 dB'
                            },
                            'electrical': {
                                'separate_circuit': True,
                                'grounded_outlets': True
                            },
                            'application_process': {
                                'permit_required': True,
                                'documentation_required': [
                                    'Floor plans (before and after)',
                                    'Technical drawings',
                                    'Fire safety documentation',
                                    'Sound insulation documentation',
                                    'Ventilation plan'
                                ],
                                'estimated_processing_time': '8-12 weeks',
                                'fee': 'NOK 5,000 - 14,000'
                            }
                        }
                    }
                },
                'stavanger': {
                    'name': 'Stavanger',
                    'municipality_id': '1103',
                    'regulations': {
                        'rental_unit': {
                            'min_area': 25,
                            'min_ceiling_height': 2.2,
                            'separate_entrance': True,
                            'bathroom_required': True,
                            'kitchen_required': True,
                            'fire_safety': {
                                'smoke_detector': True,
                                'fire_extinguisher': True,
                                'escape_route': True
                            },
                            'ventilation': {
                                'bathroom': 'mechanical',
                                'kitchen': 'mechanical'
                            },
                            'sound_insulation': {
                                'walls': 'R\'w ≥ 55 dB',
                                'floors': 'L\'n,w ≤ 53 dB'
                            },
                            'electrical': {
                                'separate_circuit': True,
                                'grounded_outlets': True
                            },
                            'application_process': {
                                'permit_required': True,
                                'documentation_required': [
                                    'Floor plans (before and after)',
                                    'Technical drawings',
                                    'Fire safety documentation',
                                    'Sound insulation documentation'
                                ],
                                'estimated_processing_time': '6-10 weeks',
                                'fee': 'NOK 4,000 - 12,000'
                            }
                        }
                    }
                }
            },
            'general_regulations': {
                'building_code': {
                    'name': 'TEK17',
                    'url': 'https://dibk.no/regelverk/byggteknisk-forskrift-tek17/',
                    'key_requirements': {
                        'fire_safety': 'Chapter 11',
                        'ventilation': 'Chapter 13',
                        'sound_insulation': 'Chapter 13',
                        'accessibility': 'Chapter 12',
                        'energy_efficiency': 'Chapter 14'
                    }
                },
                'planning_and_building_act': {
                    'name': 'Plan- og bygningsloven',
                    'url': 'https://lovdata.no/dokument/NL/lov/2008-06-27-71',
                    'key_sections': {
                        'permit_requirements': 'Chapter 20',
                        'application_process': 'Chapter 21',
                        'supervision': 'Chapter 25',
                        'sanctions': 'Chapter 32'
                    }
                }
            }
        }
    
    def _init_municipal_plans(self):
        """
        Initialize municipal plans data.
        """
        self.kommune_planer = {
            "0301": {  # Oslo
                "kommune_navn": "Oslo",
                "kommuneplan_navn": "Kommuneplan Oslo 2030",
                "sist_oppdatert": "2022-05-15",
                "plan_perioder": ["2022-2030"],
                "hovedfokus": ["Knutepunktutvikling", "Grønn mobilitet", "Fortetting"],
                "spesielle_hensyn": ["Kulturminner", "Blågrønn struktur", "Marka"]
            },
            "1103": {  # Stavanger
                "kommune_navn": "Stavanger",
                "kommuneplan_navn": "Kommuneplan Stavanger 2023-2040",
                "sist_oppdatert": "2023-01-10",
                "plan_perioder": ["2023-2040"],
                "hovedfokus": ["Havneutvikling", "Boligfortetting", "Næringsklynger"],
                "spesielle_hensyn": ["Kystsone", "Landbruksområder", "Historisk sentrum"]
            },
            "5001": {  # Trondheim
                "kommune_navn": "Trondheim",
                "kommuneplan_navn": "Kommuneplan Trondheim 2020-2032",
                "sist_oppdatert": "2020-09-25",
                "plan_perioder": ["2020-2032"],
                "hovedfokus": ["Campusutvikling", "Kollektivtransport", "Klimanøytral by"],
                "spesielle_hensyn": ["Universitetsområder", "Nidelvkorridoren", "Historisk sentrum"]
            },
            "4601": {  # Bergen
                "kommune_navn": "Bergen",
                "kommuneplan_navn": "Kommuneplan Bergen 2022-2035",
                "sist_oppdatert": "2022-03-30",
                "plan_perioder": ["2022-2035"],
                "hovedfokus": ["Byfjellene", "Havneutvikling", "Bybanen"],
                "spesielle_hensyn": ["Verdensarv", "Flomsoner", "Rasfare"]
            }
        }
    
    def _init_zoning_plans(self):
        """
        Initialize zoning plans data.
        """
        self.reguleringsplaner = {
            "0301": {  # Oslo
                "sentrum": {
                    "navn": "Sentrumsplan Oslo",
                    "plan_id": "S-4950",
                    "vedtatt_dato": "2019-04-12",
                    "formål": "Sentrumsformål",
                    "utnyttelsesgrad": 3.5,
                    "maks_høyde": 24.0,
                    "bestemmelser": [
                        "Minst 20% av arealet skal være bolig",
                        "Aktive fasader mot gateplan",
                        "Bevaring av kulturmiljø"
                    ]
                },
                "hovinbyen": {
                    "navn": "Områderegulering Hovinbyen",
                    "plan_id": "S-4810",
                    "vedtatt_dato": "2018-11-05",
                    "formål": "Transformasjon",
                    "utnyttelsesgrad": 3.0,
                    "maks_høyde": 20.0,
                    "bestemmelser": [
                        "Blandet formål bolig/næring",
                        "Grønn mobilitet",
                        "Overvannshåndtering lokalt"
                    ]
                }
            },
            "1103": {  # Stavanger
                "paradis": {
                    "navn": "Områdeplan Paradis",
                    "plan_id": "2535",
                    "vedtatt_dato": "2020-06-18",
                    "formål": "Bolig/Næring",
                    "utnyttelsesgrad": 2.8,
                    "maks_høyde": 18.0,
                    "bestemmelser": [
                        "Krav om næring i første etasje",
                        "Sykkelparkering 2 plasser per bolig",
                        "Miljøvennlige materialer"
                    ]
                }
            },
            "5001": {  # Trondheim
                "brattøra": {
                    "navn": "Områderegulering Brattøra",
                    "plan_id": "r20180015",
                    "vedtatt_dato": "2021-03-25",
                    "formål": "Næring/Havn",
                    "utnyttelsesgrad": 3.0,
                    "maks_høyde": 20.0,
                    "bestemmelser": [
                        "Havnerelatert virksomhet prioriteres",
                        "Klimatilpasning sjøfront",
                        "Publikumstilgang til sjøen"
                    ]
                }
            },
            "4601": {  # Bergen
                "bergen_sentrum": {
                    "navn": "Sentrumsplan Bergen",
                    "plan_id": "64040000",
                    "vedtatt_dato": "2022-02-15",
                    "formål": "Sentrumsformål",
                    "utnyttelsesgrad": 3.2,
                    "maks_høyde": 22.0,
                    "bestemmelser": [
                        "Vern av historisk bebyggelse",
                        "Blågrønne korridorer",
                        "Flomsikring"
                    ]
                }
            }
        }
    
    def _init_building_processes(self):
        """
        Initialize building application processes data.
        """
        self.byggesak_prosesser = {
            "0301": {  # Oslo
                "rammetillatelse": {
                    "behandlingstid": "8-12 uker",
                    "gebyr": 50000,
                    "dokumentkrav": [
                        "Situasjonsplan",
                        "Tegninger",
                        "Redegjørelse for utnyttelsesgrad",
                        "Nabovarsling"
                    ]
                },
                "dispensasjon": {
                    "behandlingstid": "12-16 uker",
                    "gebyr": 30000,
                    "dokumentkrav": [
                        "Begrunnelse for dispensasjon",
                        "Konsekvensutredning",
                        "Uttalelser fra berørte myndigheter"
                    ]
                }
            },
            "1103": {  # Stavanger
                "rammetillatelse": {
                    "behandlingstid": "6-10 uker",
                    "gebyr": 45000,
                    "dokumentkrav": [
                        "Situasjonsplan",
                        "Tegninger",
                        "Redegjørelse for utnyttelsesgrad",
                        "Nabovarsling"
                    ]
                }
            },
            "5001": {  # Trondheim
                "rammetillatelse": {
                    "behandlingstid": "8-12 uker",
                    "gebyr": 48000,
                    "dokumentkrav": [
                        "Situasjonsplan",
                        "Tegninger",
                        "Redegjørelse for utnyttelsesgrad",
                        "Nabovarsling",
                        "Ventilasjonsdokumentasjon"
                    ]
                }
            },
            "4601": {  # Bergen
                "rammetillatelse": {
                    "behandlingstid": "6-10 uker",
                    "gebyr": 46000,
                    "dokumentkrav": [
                        "Situasjonsplan",
                        "Tegninger",
                        "Redegjørelse for utnyttelsesgrad",
                        "Nabovarsling"
                    ]
                }
            }
        }
    
    # ---- Building Regulations Methods ----
    
    def get_rental_unit_requirements(self, municipality: str) -> Dict[str, Any]:
        """
        Get rental unit requirements for a specific municipality.
        
        Args:
            municipality: Municipality name
            
        Returns:
            Rental unit requirements
        """
        municipality = municipality.lower()
        
        # Check cache first
        if municipality in self.regulations_cache:
            logger.info(f"Using cached regulations for {municipality}")
            return self.regulations_cache[municipality]
        
        # Try to get from API if credentials are available
        if self.api_key and self.api_base_url:
            try:
                regulations = self._fetch_regulations_from_api(municipality)
                if regulations:
                    self.regulations_cache[municipality] = regulations
                    return regulations
            except Exception as e:
                logger.error(f"Error fetching regulations from API: {e}")
        
        # Fall back to local database
        if municipality in self.regulations_db['municipalities']:
            logger.info(f"Using local database regulations for {municipality}")
            regulations = self.regulations_db['municipalities'][municipality]['regulations']['rental_unit']
            self.regulations_cache[municipality] = regulations
            return regulations
        
        # If municipality not found, return Oslo regulations as default
        logger.warning(f"Municipality {municipality} not found, using Oslo regulations as default")
        default_regulations = self.regulations_db['municipalities']['oslo']['regulations']['rental_unit']
        self.regulations_cache[municipality] = default_regulations
        return default_regulations
    
    def _fetch_regulations_from_api(self, municipality: str) -> Dict[str, Any]:
        """
        Fetch regulations from API.
        
        Args:
            municipality: Municipality name
            
        Returns:
            Regulations from API
        """
        url = f"{self.api_base_url}/municipalities/{municipality}/regulations/rental-unit"
        headers = {
            'Authorization': f"Bearer {self.api_key}",
            'Accept': 'application/json'
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            return None
    
    def get_application_process(self, municipality: str) -> Dict[str, Any]:
        """
        Get application process information for a specific municipality.
        
        Args:
            municipality: Municipality name
            
        Returns:
            Application process information
        """
        requirements = self.get_rental_unit_requirements(municipality)
        return requirements.get('application_process', {})
    
    def get_fire_safety_requirements(self, municipality: str) -> Dict[str, Any]:
        """
        Get fire safety requirements for a specific municipality.
        
        Args:
            municipality: Municipality name
            
        Returns:
            Fire safety requirements
        """
        requirements = self.get_rental_unit_requirements(municipality)
        return requirements.get('fire_safety', {})
    
    def get_sound_insulation_requirements(self, municipality: str) -> Dict[str, Any]:
        """
        Get sound insulation requirements for a specific municipality.
        
        Args:
            municipality: Municipality name
            
        Returns:
            Sound insulation requirements
        """
        requirements = self.get_rental_unit_requirements(municipality)
        return requirements.get('sound_insulation', {})
    
    def get_ventilation_requirements(self, municipality: str) -> Dict[str, Any]:
        """
        Get ventilation requirements for a specific municipality.
        
        Args:
            municipality: Municipality name
            
        Returns:
            Ventilation requirements
        """
        requirements = self.get_rental_unit_requirements(municipality)
        return requirements.get('ventilation', {})
    
    def get_general_building_code(self) -> Dict[str, Any]:
        """
        Get general building code information.
        
        Returns:
            Building code information
        """
        return self.regulations_db['general_regulations']['building_code']
    
    def get_planning_and_building_act(self) -> Dict[str, Any]:
        """
        Get planning and building act information.
        
        Returns:
            Planning and building act information
        """
        return self.regulations_db['general_regulations']['planning_and_building_act']
    
    def check_compliance(self, municipality: str, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check if a property complies with municipal requirements for rental units.
        
        Args:
            municipality: Municipality name
            property_data: Property data
            
        Returns:
            Compliance check results
        """
        requirements = self.get_rental_unit_requirements(municipality)
        
        # Extract rental unit data
        rental_unit = property_data.get('rental_unit', {})
        
        # Initialize results
        results = {
            'compliant': True,
            'requirements_met': [],
            'requirements_not_met': [],
            'requirements_unknown': []
        }
        
        # Check minimum area
        if 'area' in rental_unit:
            if rental_unit['area'] >= requirements['min_area']:
                results['requirements_met'].append({
                    'id': 'min_area',
                    'name': 'Minimum area',
                    'requirement': f"{requirements['min_area']} m²",
                    'actual': f"{rental_unit['area']} m²"
                })
            else:
                results['compliant'] = False
                results['requirements_not_met'].append({
                    'id': 'min_area',
                    'name': 'Minimum area',
                    'requirement': f"{requirements['min_area']} m²",
                    'actual': f"{rental_unit['area']} m²"
                })
        else:
            results['requirements_unknown'].append({
                'id': 'min_area',
                'name': 'Minimum area',
                'requirement': f"{requirements['min_area']} m²",
                'actual': 'Unknown'
            })
        
        # Check ceiling height
        if 'ceiling_height' in rental_unit:
            if rental_unit['ceiling_height'] >= requirements['min_ceiling_height']:
                results['requirements_met'].append({
                    'id': 'min_ceiling_height',
                    'name': 'Minimum ceiling height',
                    'requirement': f"{requirements['min_ceiling_height']} m",
                    'actual': f"{rental_unit['ceiling_height']} m"
                })
            else:
                results['compliant'] = False
                results['requirements_not_met'].append({
                    'id': 'min_ceiling_height',
                    'name': 'Minimum ceiling height',
                    'requirement': f"{requirements['min_ceiling_height']} m",
                    'actual': f"{rental_unit['ceiling_height']} m"
                })
        else:
            results['requirements_unknown'].append({
                'id': 'min_ceiling_height',
                'name': 'Minimum ceiling height',
                'requirement': f"{requirements['min_ceiling_height']} m",
                'actual': 'Unknown'
            })
        
        # Check separate entrance
        if 'separate_entrance' in rental_unit:
            if rental_unit['separate_entrance'] == requirements['separate_entrance']:
                results['requirements_met'].append({
                    'id': 'separate_entrance',
                    'name': 'Separate entrance',
                    'requirement': 'Required',
                    'actual': 'Present'
                })
            else:
                results['compliant'] = False
                results['requirements_not_met'].append({
                    'id': 'separate_entrance',
                    'name': 'Separate entrance',
                    'requirement': 'Required',
                    'actual': 'Not present'
                })
        else:
            results['requirements_unknown'].append({
                'id': 'separate_entrance',
                'name': 'Separate entrance',
                'requirement': 'Required',
                'actual': 'Unknown'
            })
        
        # Check bathroom
        if 'bathroom' in rental_unit:
            if rental_unit['bathroom'] == requirements['bathroom_required']:
                results['requirements_met'].append({
                    'id': 'bathroom',
                    'name': 'Bathroom',
                    'requirement': 'Required',
                    'actual': 'Present'
                })
            else:
                results['compliant'] = False
                results['requirements_not_met'].append({
                    'id': 'bathroom',
                    'name': 'Bathroom',
                    'requirement': 'Required',
                    'actual': 'Not present'
                })
        else:
            results['requirements_unknown'].append({
                'id': 'bathroom',
                'name': 'Bathroom',
                'requirement': 'Required',
                'actual': 'Unknown'
            })
        
        # Check kitchen
        if 'kitchen' in rental_unit:
            if rental_unit['kitchen'] == requirements['kitchen_required']:
                results['requirements_met'].append({
                    'id': 'kitchen',
                    'name': 'Kitchen',
                    'requirement': 'Required',
                    'actual': 'Present'
                })
            else:
                results['compliant'] = False
                results['requirements_not_met'].append({
                    'id': 'kitchen',
                    'name': 'Kitchen',
                    'requirement': 'Required',
                    'actual': 'Not present'
                })
        else:
            results['requirements_unknown'].append({
                'id': 'kitchen',
                'name': 'Kitchen',
                'requirement': 'Required',
                'actual': 'Unknown'
            })
        
        # Add summary
        results['summary'] = {
            'total_requirements': len(requirements),
            'met': len(results['requirements_met']),
            'not_met': len(results['requirements_not_met']),
            'unknown': len(results['requirements_unknown'])
        }
        
        return results
    
    def get_documentation_requirements(self, municipality: str) -> List[str]:
        """
        Get documentation requirements for a rental unit application.
        
        Args:
            municipality: Municipality name
            
        Returns:
            List of required documentation
        """
        application_process = self.get_application_process(municipality)
        return application_process.get('documentation_required', [])
    
    def get_estimated_costs(self, municipality: str) -> Dict[str, Any]:
        """
        Get estimated costs for a rental unit application.
        
        Args:
            municipality: Municipality name
            
        Returns:
            Estimated costs
        """
        application_process = self.get_application_process(municipality)
        
        return {
            'application_fee': application_process.get('fee', 'Unknown'),
            'estimated_construction_costs': {
                'low': 'NOK 250,000',
                'medium': 'NOK 450,000',
                'high': 'NOK 650,000'
            },
            'estimated_professional_fees': {
                'architect': 'NOK 15,000 - 30,000',
                'engineer': 'NOK 10,000 - 25,000',
                'fire_safety_consultant': 'NOK 5,000 - 15,000'
            }
        }
    
    # ---- Municipal Planning and Zoning Methods ----
    
    def get_kommuneplan(self, municipality_id: str) -> Dict[str, Any]:
        """
        Get municipal plan information for a given municipality.
        
        Args:
            municipality_id: Municipality ID
            
        Returns:
            Municipal plan information
        """
        logger.info(f"Getting municipal plan for municipality {municipality_id}")
        
        # Check if we have data for the municipality
        if municipality_id not in self.kommune_planer:
            logger.warning(f"No municipal plan data for municipality {municipality_id}")
            return {"error": "Municipal plan not found", "municipality_id": municipality_id}
        
        return self.kommune_planer[municipality_id]
    
    def get_reguleringsplaner(self, municipality_id: str, area_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Get zoning plans for a given municipality and optionally area.
        
        Args:
            municipality_id: Municipality ID
            area_name: Optional area name
            
        Returns:
            Zoning plans
        """
        logger.info(f"Getting zoning plans for municipality {municipality_id}, area: {area_name}")
        
        # Check if we have data for the municipality
        if municipality_id not in self.reguleringsplaner:
            logger.warning(f"No zoning plans for municipality {municipality_id}")
            return {"error": "Zoning plans not found", "municipality_id": municipality_id}
        
        # If area is specified, return only that area
        if area_name and area_name in self.reguleringsplaner[municipality_id]:
            return {area_name: self.reguleringsplaner[municipality_id][area_name]}
        
        return self.reguleringsplaner[municipality_id]
    
    def get_byggesak_info(self, municipality_id: str, process_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Get building application process information.
        
        Args:
            municipality_id: Municipality ID
            process_type: Optional process type
            
        Returns:
            Building application process information
        """
        logger.info(f"Getting building application info for municipality {municipality_id}, type: {process_type}")
        
        # Check if we have data for the municipality
        if municipality_id not in self.byggesak_prosesser:
            logger.warning(f"No building application info for municipality {municipality_id}")
            return {"error": "Building application info not found", "municipality_id": municipality_id}
        
        # If process type is specified, return only that type
        if process_type and process_type in self.byggesak_prosesser[municipality_id]:
            return {process_type: self.byggesak_prosesser[municipality_id][process_type]}
        
        return self.byggesak_prosesser[municipality_id]
    
    def get_property_regulations(self, address: str, municipality_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get regulations for a given property.
        
        Args:
            address: Property address
            municipality_id: Optional municipality ID
            
        Returns:
            Property regulations
        """
        logger.info(f"Getting regulations for property: {address}")
        
        # If municipality ID is not provided, try to derive from address (simplified)
        if not municipality_id:
            # Simple way to assign a municipality based on random criteria
            # In a real implementation this would be based on geolocation
            postal_code = ""
            for part in address.split():
                if part.isdigit() and len(part) == 4:
                    postal_code = part
                    break
            
            if postal_code:
                first_digit = postal_code[0]
                if first_digit in ["0", "1"]:
                    municipality_id = "0301"  # Oslo
                elif first_digit == "4":
                    municipality_id = "1103"  # Stavanger
                elif first_digit == "7":
                    municipality_id = "5001"  # Trondheim
                elif first_digit == "5":
                    municipality_id = "4601"  # Bergen
                else:
                    municipality_id = "0301"  # Default to Oslo
            else:
                municipality_id = "0301"  # Default to Oslo
        
        # Get municipal plan
        kommune_plan = self.get_kommuneplan(municipality_id)
        
        # Select a random zoning plan for the municipality (simplified)
        if municipality_id in self.reguleringsplaner:
            area_keys = list(self.reguleringsplaner[municipality_id].keys())
            if area_keys:
                selected_area = random.choice(area_keys)
                regulering = self.reguleringsplaner[municipality_id][selected_area]
            else:
                regulering = {"error": "No zoning plans found for the municipality"}
        else:
            regulering = {"error": "No zoning plans found for the municipality"}
        
        # Combine data
        result = {
            "eiendom": {
                "adresse": address,
                "kommune_id": municipality_id,
                "kommune_navn": kommune_plan.get("kommune_navn", "Unknown municipality")
            },
            "kommuneplan": {
                "navn": kommune_plan.get("kommuneplan_navn", "Unknown municipal plan"),
                "periode": kommune_plan.get("plan_perioder", ["Unknown"])[0],
                "hovedfokus": kommune_plan.get("hovedfokus", ["Unknown"]),
                "spesielle_hensyn": kommune_plan.get("spesielle_hensyn", ["None"])
            },
            "reguleringsplan": regulering if not isinstance(regulering, dict) or "error" not in regulering else {
                "navn": "No applicable zoning plan",
                "plan_id": "N/A",
                "formål": "Follow municipal plan",
                "utnyttelsesgrad": 0.0,
                "maks_høyde": 0.0,
                "bestemmelser": ["Follow municipal plan"]
            },
            "byggesak": {
                "prosesser": list(self.byggesak_prosesser.get(municipality_id, {}).keys()),
                "kontaktinfo": {
                    "avdeling": "Building Department, " + kommune_plan.get("kommune_navn", "Unknown municipality"),
                    "epost": "byggesak@" + kommune_plan.get("kommune_navn", "kommune").lower().replace(" ", "") + ".kommune.no",
                    "telefon": "12345678"
                }
            }
        }
        
        return result
    
    def get_municipality_id_by_name(self, municipality_name: str) -> str:
        """
        Get municipality ID by name.
        
        Args:
            municipality_name: Municipality name
            
        Returns:
            Municipality ID
        """
        municipality_name = municipality_name.lower()
        
        # Check in regulations database
        for muni_key, muni_data in self.regulations_db['municipalities'].items():
            if muni_data['name'].lower() == municipality_name:
                return muni_data.get('municipality_id', '')
        
        # Check in kommune_planer as backup
        for muni_id, muni_data in self.kommune_planer.items():
            if muni_data['kommune_navn'].lower() == municipality_name:
                return muni_id
        
        logger.warning(f"Municipality ID not found for name: {municipality_name}")
        return ""
    
    def get_municipality_name_by_id(self, municipality_id: str) -> str:
        """
        Get municipality name by ID.
        
        Args:
            municipality_id: Municipality ID
            
        Returns:
            Municipality name
        """
        # Check in kommune_planer
        if municipality_id in self.kommune_planer:
            return self.kommune_planer[municipality_id]['kommune_navn']
        
        # Check in regulations database as backup
        for muni_key, muni_data in self.regulations_db['municipalities'].items():
            if muni_data.get('municipality_id', '') == municipality_id:
                return muni_data['name']
        
        logger.warning(f"Municipality name not found for ID: {municipality_id}")
        return "Unknown municipality"
    
    def convert_municipality_name_to_id(self, name_or_id: str) -> str:
        """
        Convert municipality name to ID if it's a name, or return as is if it's an ID.
        
        Args:
            name_or_id: Municipality name or ID
            
        Returns:
            Municipality ID
        """
        # Check if it's already an ID (assuming IDs are numeric)
        if name_or_id.isdigit():
            return name_or_id
        
        # Try to convert from name to ID
        municipality_id = self.get_municipality_id_by_name(name_or_id)
        if municipality_id:
            return municipality_id
        
        # Return default if conversion fails
        logger.warning(f"Could not convert municipality name to ID: {name_or_id}")
        return "0301"  # Default to Oslo
    
    def get_rental_unit_requirements_by_id(self, municipality_id: str) -> Dict[str, Any]:
        """
        Get rental unit requirements by municipality ID.
        
        Args:
            municipality_id: Municipality ID
            
        Returns:
            Rental unit requirements
        """
        municipality_name = self.get_municipality_name_by_id(municipality_id).lower()
        return self.get_rental_unit_requirements(municipality_name)
    
    def get_combined_property_info(self, address: str, municipality_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get combined property information including zoning and rental requirements.
        
        Args:
            address: Property address
            municipality_id: Optional municipality ID
            
        Returns:
            Combined property information
        """
        # Get property regulations first
        property_info = self.get_property_regulations(address, municipality_id)
        
        # Extract municipality ID
        municipality_id = property_info['eiendom']['kommune_id']
        
        # Get municipality name
        municipality_name = self.get_municipality_name_by_id(municipality_id).lower()
        
        # Get rental unit requirements
        rental_requirements = self.get_rental_unit_requirements(municipality_name)
        
        # Add rental unit requirements to property info
        property_info['rental_requirements'] = rental_requirements
        
        # Add building application processes
        property_info['byggesak_prosesser'] = self.get_byggesak_info(municipality_id)
        
        return property_info
    
    def search_regulations(self, query: str) -> Dict[str, Any]:
        """
        Search regulations for specific terms.
        
        Args:
            query: Search query
            
        Returns:
            Search results
        """
        query = query.lower()
        results = {
            'municipalities': [],
            'regulations': [],
            'zoning_plans': []
        }
        
        # Search in municipalities
        for muni_key, muni_data in self.regulations_db['municipalities'].items():
            if query in muni_key.lower() or query in muni_data['name'].lower():
                results['municipalities'].append({
                    'key': muni_key,
                    'name': muni_data['name'],
                    'municipality_id': muni_data.get('municipality_id', '')
                })
        
        # Search in general regulations
        for reg_key, reg_data in self.regulations_db['general_regulations'].items():
            if query in reg_key.lower() or query in reg_data['name'].lower():
                results['regulations'].append({
                    'key': reg_key,
                    'name': reg_data['name'],
                    'url': reg_data.get('url', '')
                })
        
        # Search in zoning plans
        for muni_id, areas in self.reguleringsplaner.items():
            for area_key, area_data in areas.items():
                if (query in area_key.lower() or 
                    query in area_data['navn'].lower() or 
                    query in area_data['formål'].lower()):
                    results['zoning_plans'].append({
                        'municipality_id': muni_id,
                        'municipality_name': self.get_municipality_name_by_id(muni_id),
                        'area': area_key,
                        'name': area_data['navn'],
                        'purpose': area_data['formål']
                    })
        
        return results

# Example usage
if __name__ == "__main__":
    commune_connect = CommuneConnect()
    
    # Example 1: Get rental unit requirements for Oslo
    oslo_requirements = commune_connect.get_rental_unit_requirements('oslo')
    print(json.dumps(oslo_requirements, indent=2))
    
    # Example 2: Check property compliance
    property_data = {
        'rental_unit': {
            'area': 30,
            'ceiling_height': 2.3,
            'separate_entrance': True,
            'bathroom': True,
            'kitchen': True
        }
    }
    
    compliance = commune_connect.check_compliance('oslo', property_data)
    print(json.dumps(compliance, indent=2))
    
    # Example 3: Get combined property information
    property_info = commune_connect.get_combined_property_info('Storgata 1, 0182 Oslo')
    print(json.dumps(property_info, indent=2))
