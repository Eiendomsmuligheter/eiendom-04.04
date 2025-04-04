"""
Automatisk byggesaksgenerator
Genererer komplette byggesaksdokumenter basert på analyse
"""
from typing import Dict, List, Optional
import json
from datetime import datetime
from pathlib import Path
import asyncio
from PyPDF2 import PdfFileMerger
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
import os
import logging
import sys
import tempfile
import shutil
import requests
from PIL import Image
import uuid

# Legg til prosjektets rotmappe i PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Importer 3D-modelleringstjenesten
try:
    from backend.services.modeling_3d import generate_model_with_ai_analysis, ModelingOptions
except ImportError:
    try:
        from services.modeling_3d import generate_model_with_ai_analysis, ModelingOptions
    except ImportError:
        logging.error("Kunne ikke importere 3D-modelleringstjenesten")
        generate_model_with_ai_analysis = None
        ModelingOptions = None

# Sett opp logging
logger = logging.getLogger(__name__)

class BuildingApplicationGenerator:
    def __init__(self):
        self.templates_dir = Path(__file__).parent / "templates"
        self.forms_dir = Path(__file__).parent / "forms"
        self.regulations_db = None
        self.current_municipality = None
        
        # Støttede eksterne tjenester
        self.external_services = {
            "spacely": self._integrate_spacely_ai,
            "roomsgpt": self._integrate_roomsgpt,
            "decoratly": self._integrate_decoratly,
            "archi": self._integrate_archi
        }

    async def generate_complete_application(self,
                                         analysis_results: Dict,
                                         property_info: Dict,
                                         municipality: str,
                                         include_3d_models: bool = True,
                                         external_services: List[str] = None) -> Dict:
        """
        Genererer komplett byggesøknad med alle nødvendige dokumenter
        
        Args:
            analysis_results: Resultater fra eiendomsanalysen
            property_info: Informasjon om eiendommen
            municipality: Kommunenavn
            include_3d_models: Om 3D-modeller skal inkluderes
            external_services: Liste over eksterne tjenester som skal integreres
            
        Returns:
            Dict med informasjon om genererte dokumenter
        """
        self.current_municipality = municipality
        external_services = external_services or []
        
        # Generate all required documents
        documents = await asyncio.gather(
            self._generate_main_application(analysis_results, property_info),
            self._generate_property_information(analysis_results, property_info),
            self._generate_neighbor_notification(property_info),
            self._generate_situation_plan(analysis_results),
            self._generate_floor_plans(analysis_results),
            self._generate_facade_drawings(analysis_results),
            self._generate_section_drawings(analysis_results),
            self._generate_detail_drawings(analysis_results),
            self._generate_fire_safety_documentation(analysis_results),
            self._generate_building_physics_documentation(analysis_results)
        )
        
        # Generate 3D models if requested
        if include_3d_models and generate_model_with_ai_analysis:
            try:
                logger.info("Genererer 3D-modeller for byggesøknad")
                property_id = property_info.get("id", str(uuid.uuid4()))
                
                # Generer 3D-modell med AI-analyse
                model_options = ModelingOptions(
                    resolution=10.0,
                    include_buildings=True,
                    include_terrain=True,
                    terrain_radius=100.0,
                    format="glb"
                )
                
                model_metadata = await generate_model_with_ai_analysis(
                    property_id=property_id,
                    property_data=property_info,
                    options=model_options
                )
                
                # Generer skjermbilder av modellen for inkludering i søknaden
                model_screenshots = await self._generate_model_screenshots(model_metadata)
                
                # Legg til 3D-modellene i dokumentlisten
                documents.append({
                    "type": "3d_model",
                    "title": "3D-modell av eksisterende situasjon",
                    "path": model_metadata.get("files", [])[0].get("path") if model_metadata.get("files") else None,
                    "screenshots": model_screenshots.get("existing", [])
                })
                
                if model_metadata.get("ai_enhanced", False):
                    documents.append({
                        "type": "3d_model_enhanced",
                        "title": "3D-modell med utviklingsforslag",
                        "path": next((f.get("path") for f in model_metadata.get("files", []) if f.get("type") == "ai_enhanced"), None),
                        "screenshots": model_screenshots.get("enhanced", []),
                        "ai_analysis": model_metadata.get("ai_analysis_summary", {})
                    })
            except Exception as e:
                logger.error(f"Feil ved generering av 3D-modeller: {str(e)}")
        
        # Integrer eksterne tjenester hvis forespurt
        for service_name in external_services:
            if service_name in self.external_services:
                try:
                    service_docs = await self.external_services[service_name](analysis_results, property_info)
                    if service_docs:
                        documents.extend(service_docs)
                except Exception as e:
                    logger.error(f"Feil ved integrering av {service_name}: {str(e)}")
        
        # Combine all documents into a complete application
        complete_application = {
            "municipality": municipality,
            "property_id": property_info.get("id"),
            "application_date": datetime.now().isoformat(),
            "documents": documents,
            "submission_checklist": await self._generate_checklist(documents)
        }
        
        return complete_application

    async def _generate_model_screenshots(self, model_metadata: Dict) -> Dict:
        """
        Genererer skjermbilder av 3D-modellen for inkludering i søknaden
        
        Args:
            model_metadata: Metadata for 3D-modellen
            
        Returns:
            Dict med stier til skjermbilder
        """
        screenshots = {
            "existing": [],
            "enhanced": []
        }
        
        try:
            model_id = model_metadata.get("model_id")
            model_dir = os.path.join("data/models", model_id)
            
            # Generer skjermbilder for eksisterende modell
            existing_model_path = next((f.get("path") for f in model_metadata.get("files", []) 
                                      if f.get("type") == "combined"), None)
            
            if existing_model_path and os.path.exists(existing_model_path):
                # Her ville vi normalt bruke en headless renderer for å ta skjermbilder
                # For demonstrasjonsformål lager vi bare tomme bildefiler
                for view in ["front", "top", "side", "perspective"]:
                    screenshot_path = os.path.join(model_dir, f"existing_{view}.png")
                    # I en ekte implementasjon ville vi rendere modellen fra forskjellige vinkler
                    # Her lager vi bare en tom fil
                    with open(screenshot_path, "wb") as f:
                        # Lag et tomt bilde
                        img = Image.new("RGB", (800, 600), color=(255, 255, 255))
                        img.save(f, "PNG")
                    screenshots["existing"].append({
                        "view": view,
                        "path": screenshot_path
                    })
            
            # Generer skjermbilder for forbedret modell hvis tilgjengelig
            enhanced_model_path = next((f.get("path") for f in model_metadata.get("files", []) 
                                      if f.get("type") == "ai_enhanced"), None)
            
            if enhanced_model_path and os.path.exists(enhanced_model_path):
                for view in ["front", "top", "side", "perspective"]:
                    screenshot_path = os.path.join(model_dir, f"enhanced_{view}.png")
                    # I en ekte implementasjon ville vi rendere modellen fra forskjellige vinkler
                    with open(screenshot_path, "wb") as f:
                        # Lag et tomt bilde
                        img = Image.new("RGB", (800, 600), color=(255, 255, 255))
                        img.save(f, "PNG")
                    screenshots["enhanced"].append({
                        "view": view,
                        "path": screenshot_path
                    })
        
        except Exception as e:
            logger.error(f"Feil ved generering av modellskjermbilder: {str(e)}")
        
        return screenshots

    async def _integrate_spacely_ai(self, analysis_results: Dict, property_info: Dict) -> List[Dict]:
        """
        Integrerer SpacelyAI for romplanlegging
        """
        logger.info("Integrerer SpacelyAI for romplanlegging")
        # Dette ville normalt være en faktisk API-integrasjon
        return [{
            "type": "spacely_floor_plan",
            "title": "SpacelyAI Romplanlegging",
            "path": None  # I en ekte implementasjon ville dette være en faktisk filsti
        }]

    async def _integrate_roomsgpt(self, analysis_results: Dict, property_info: Dict) -> List[Dict]:
        """
        Integrerer RoomsGPT for romvisualisering
        """
        logger.info("Integrerer RoomsGPT for romvisualisering")
        # Dette ville normalt være en faktisk API-integrasjon
        return [{
            "type": "roomsgpt_visualization",
            "title": "RoomsGPT Romvisualisering",
            "path": None  # I en ekte implementasjon ville dette være en faktisk filsti
        }]

    async def _integrate_decoratly(self, analysis_results: Dict, property_info: Dict) -> List[Dict]:
        """
        Integrerer Decoratly for interiørdesign
        """
        logger.info("Integrerer Decoratly for interiørdesign")
        # Dette ville normalt være en faktisk API-integrasjon
        return [{
            "type": "decoratly_interior",
            "title": "Decoratly Interiørdesign",
            "path": None  # I en ekte implementasjon ville dette være en faktisk filsti
        }]

    async def _integrate_archi(self, analysis_results: Dict, property_info: Dict) -> List[Dict]:
        """
        Integrerer Archi for arkitektonisk visualisering
        """
        logger.info("Integrerer Archi for arkitektonisk visualisering")
        # Dette ville normalt være en faktisk API-integrasjon
        return [{
            "type": "archi_visualization",
            "title": "Archi Arkitektonisk Visualisering",
            "path": None  # I en ekte implementasjon ville dette være en faktisk filsti
        }]

    async def _generate_main_application(self,
                                      analysis_results: Dict,
                                      property_info: Dict) -> Dict:
        """
        Genererer hovedsøknadsskjema
        """
        # Load template
        template = await self._load_template("soknad_om_tillatelse.pdf")
        
        # Fill in property information
        filled_form = await self._fill_property_info(template, property_info)
        
        # Add measure details
        filled_form = await self._fill_measure_details(filled_form, analysis_results)
        
        # Add responsible applicants
        filled_form = await self._add_responsible_parties(filled_form)
        
        return {
            "document_type": "main_application",
            "content": filled_form,
            "validation": await self._validate_form(filled_form)
        }

    async def _generate_situation_plan(self, analysis_results: Dict) -> Dict:
        """
        Genererer situasjonsplan i henhold til kommunens krav
        """
        # Create new drawing
        drawing = await self._create_technical_drawing("situation_plan")
        
        # Add base map
        await self._add_base_map(drawing, analysis_results["property_info"])
        
        # Draw property lines
        await self._draw_property_lines(drawing, analysis_results["property_boundaries"])
        
        # Add measurements
        await self._add_measurements(drawing, analysis_results["measurements"])
        
        # Add building placement
        await self._draw_buildings(drawing, analysis_results["buildings"])
        
        # Add utilities and infrastructure
        await self._add_utilities(drawing, analysis_results["utilities"])
        
        return {
            "document_type": "situation_plan",
            "content": drawing,
            "scale": "1:500",
            "validation": await self._validate_technical_drawing(drawing)
        }

    async def _generate_floor_plans(self, analysis_results: Dict) -> Dict:
        """
        Genererer detaljerte plantegninger
        """
        floor_plans = []
        
        for floor in analysis_results["floors"]:
            # Create new floor plan
            plan = await self._create_technical_drawing("floor_plan")
            
            # Add walls and structure
            await self._draw_walls(plan, floor["walls"])
            
            # Add rooms and areas
            await self._add_rooms(plan, floor["rooms"])
            
            # Add dimensions
            await self._add_dimensions(plan, floor["dimensions"])
            
            # Add annotations
            await self._add_annotations(plan, floor["annotations"])
            
            floor_plans.append({
                "floor_number": floor["level"],
                "drawing": plan,
                "area_calculations": await self._calculate_areas(floor)
            })
        
        return {
            "document_type": "floor_plans",
            "content": floor_plans,
            "scale": "1:100",
            "validation": await self._validate_floor_plans(floor_plans)
        }

    async def _generate_facade_drawings(self, analysis_results: Dict) -> Dict:
        """
        Genererer fasadetegninger
        """
        facades = []
        
        for direction in ["north", "south", "east", "west"]:
            # Create new facade drawing
            facade = await self._create_technical_drawing("facade")
            
            # Add terrain
            await self._draw_terrain(facade, analysis_results["terrain"])
            
            # Draw facade details
            await self._draw_facade_details(
                facade,
                analysis_results["facades"][direction]
            )
            
            # Add heights and levels
            await self._add_height_markers(facade, analysis_results["heights"])
            
            facades.append({
                "direction": direction,
                "drawing": facade
            })
        
        return {
            "document_type": "facade_drawings",
            "content": facades,
            "scale": "1:100",
            "validation": await self._validate_facade_drawings(facades)
        }

    async def _validate_application(self, application: Dict) -> Dict:
        """
        Validerer hele søknaden mot kommunens krav
        """
        validation_results = {
            "complete": True,
            "issues": [],
            "warnings": [],
            "checklist": {}
        }
        
        # Validate each document
        for doc in application["documents"]:
            doc_validation = await self._validate_document(doc)
            if not doc_validation["valid"]:
                validation_results["complete"] = False
                validation_results["issues"].extend(doc_validation["issues"])
            validation_results["warnings"].extend(doc_validation["warnings"])
            
        # Check municipal requirements
        municipal_check = await self._check_municipal_requirements(application)
        validation_results["checklist"].update(municipal_check)
        
        # Verify technical requirements
        tech_check = await self._verify_technical_requirements(application)
        validation_results["checklist"].update(tech_check)
        
        return validation_results

    async def _generate_checklist(self, documents: List[Dict]) -> Dict:
        """
        Genererer innsendingssjekkliste
        """
        checklist = {
            "documents": await self._verify_required_documents(documents),
            "technical_requirements": await self._verify_technical_requirements(documents),
            "municipal_requirements": await self._check_municipal_requirements(documents),
            "regulations": await self._verify_regulations_compliance(documents)
        }
        
        return checklist