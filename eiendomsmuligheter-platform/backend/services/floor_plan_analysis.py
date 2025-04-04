"""
FloorPlanAnalyzer - Komponent for å analysere plantegninger og foreslå endringer.

Denne komponenten kan analysere plantegninger, identifisere rom og foreslå endringer, 
inkludert muligheter for å etablere utleiedeler uten større byggearbeider.
"""
import logging
from typing import Dict, List, Any, Optional
import numpy as np
from PIL import Image
import cv2

# Sett opp logging
logger = logging.getLogger(__name__)

class FloorPlanAnalyzer:
    """Analyserer plantegninger og gir forslag til endringer og forbedringer."""
    
    def __init__(self):
        """Initialiserer FloorPlanAnalyzer med nødvendige modeller."""
        self.logger = logging.getLogger(__name__)
        self.logger.info("Initialiserer FloorPlanAnalyzer")
        # Her ville vi lastet inn ML-modeller for romgjenkjenning
        
    async def analyze(
        self, 
        floor_plans: List[str] = None,
        building_type: str = "residential",
        property_size: float = None,
        number_of_floors: int = 1,
        existing_rooms: Dict[str, int] = None
    ) -> Dict[str, Any]:
        """
        Analyser plantegninger og gi detaljert informasjon om romfordeling og potensial.
        
        Args:
            floor_plans: Liste over URL-er eller filbaner til plantegninger
            building_type: Type bygning (residential, commercial, etc)
            property_size: Størrelse på boligen i kvm
            number_of_floors: Antall etasjer
            existing_rooms: Eksisterende romfordeling hvis kjent
            
        Returns:
            Dict med analyseresultater
        """
        self.logger.info(f"Analyserer plantegning av type {building_type}")
        
        # I en faktisk implementasjon ville vi brukt computer vision for å analysere bildene
        result = {
            "rooms_detected": self._mock_room_detection(property_size, building_type),
            "total_area": property_size or 120.0,  # Standardverdi hvis ikke spesifisert
            "layout_efficiency": 0.85,  # 85% arealutnyttelse er typisk
            "potential_improvements": []
        }
        
        # Vurder potensial for utleiedel
        rental_potential = self._analyze_rental_potential(
            result["rooms_detected"],
            result["total_area"],
            number_of_floors
        )
        
        result["rental_potential"] = rental_potential
        
        return result
    
    def _mock_room_detection(self, property_size: float = None, building_type: str = "residential") -> Dict[str, Any]:
        """
        Eksempelfunksjon for å simulere romgjenkjenning fra plantegning.
        I en faktisk implementasjon ville dette være basert på CV/ML-analyse.
        """
        if not property_size:
            property_size = 120.0
            
        # Simuler romdeteksjon basert på typisk fordeling
        rooms = {
            "livingroom": {
                "area": property_size * 0.3,
                "position": {"floor": 1, "x": 0, "y": 0, "width": 5, "height": 6}
            },
            "kitchen": {
                "area": property_size * 0.15,
                "position": {"floor": 1, "x": 5, "y": 0, "width": 3, "height": 5}
            },
            "bathroom": {
                "area": property_size * 0.05,
                "position": {"floor": 1, "x": 8, "y": 0, "width": 2, "height": 2.5}
            },
            "hallway": {
                "area": property_size * 0.1,
                "position": {"floor": 1, "x": 5, "y": 5, "width": 3, "height": 2}
            }
        }
        
        # Legg til soverom basert på størrelse
        num_bedrooms = max(1, int(property_size / 50))
        bedroom_area = property_size * 0.4 / num_bedrooms
        
        for i in range(num_bedrooms):
            rooms[f"bedroom_{i+1}"] = {
                "area": bedroom_area,
                "position": {"floor": 1, "x": i*3, "y": 6, "width": 3, "height": 4}
            }
            
        return rooms
    
    def _analyze_rental_potential(
        self, 
        rooms: Dict[str, Any], 
        total_area: float,
        number_of_floors: int
    ) -> Dict[str, Any]:
        """
        Analyserer potensial for å etablere utleiedel i eksisterende bolig
        uten større byggearbeider, kun ved å endre planløsning.
        
        Args:
            rooms: Dict med rominforgasjon
            total_area: Total areal i kvm
            number_of_floors: Antall etasjer
            
        Returns:
            Dict med utleiepotensial
        """
        rental_potential = {
            "has_potential": False,
            "suggested_solutions": [],
            "estimated_cost": 0,
            "estimated_rental_income": 0,
            "roi_per_month": 0,
            "requirements_met": {
                "separate_entrance": False,
                "bathroom": False,
                "kitchen": False,
                "minimum_size": False
            }
        }
        
        # Sjekk 1: Er boligen stor nok for utleiedel? (minimum 25kvm for utleiedel)
        if total_area < 80:
            rental_potential["suggested_solutions"].append({
                "title": "Boligen er for liten for å etablere separat utleiedel",
                "description": "For å etablere utleiedel bør totalarealet være minst 80kvm."
            })
            return rental_potential
            
        # Sjekk 2: Identifiser mulige utleiedeler
        
        # Scenario 1: Ett-plans bolig med stor stue som kan deles
        if number_of_floors == 1 and any(room.get("area", 0) > 25 for name, room in rooms.items() if "living" in name.lower()):
            rental_potential["has_potential"] = True
            
            solution = {
                "title": "Del stuen for å lage hybel",
                "description": "Stuen er stor nok til å deles med en vegg for å skape en liten hybel.",
                "estimated_cost": 35000,  # Kostnad for å sette opp vegg, enkel kjøkkenkrok og inngang
                "estimated_time": "1-2 uker",
                "steps": [
                    "Sett opp skillevegg for å dele stuen",
                    "Etabler enkel kjøkkenkrok i den nye hybelen",
                    "Installer separat inngang hvis mulig",
                    "Vurder om eksisterende bad kan deles eller om et ekstra toalett bør installeres"
                ],
                "requirements": [
                    "Avklaring med kommune om krav til brannsikring",
                    "Vurdering av mulighet for separat inngang"
                ],
                "estimated_rental_income": 5000  # månedlig
            }
            
            rental_potential["suggested_solutions"].append(solution)
            rental_potential["estimated_cost"] = solution["estimated_cost"]
            rental_potential["estimated_rental_income"] = solution["estimated_rental_income"]
            rental_potential["roi_per_month"] = solution["estimated_rental_income"] / solution["estimated_cost"]
            rental_potential["requirements_met"]["minimum_size"] = True
            
        # Scenario 2: Bolig med flere etasjer - kjellerutleie eller toppetasje
        if number_of_floors > 1:
            rental_potential["has_potential"] = True
            
            solution = {
                "title": "Separate kjelleretasjen eller øverste etasje som utleiedel",
                "description": f"Med {number_of_floors} etasjer kan én etasje enkelt konverteres til separat utleiedel.",
                "estimated_cost": 65000, # Inkluderer enkel kjøkkenløsning og evt. bad hvis ikke eksisterende
                "estimated_time": "2-4 uker",
                "steps": [
                    "Etabler separat inngang til den aktuelle etasjen",
                    "Installer kjøkkenløsning hvis dette mangler",
                    "Vurder om bad må installeres eller oppgraderes",
                    "Etabler låsbare dører mellom utleiedel og hovedbolig"
                ],
                "requirements": [
                    "Sjekk om rømningsveier oppfyller forskriftskrav",
                    "Vurder om takhøyde i kjeller oppfyller krav (min. 2,2m)"
                ],
                "estimated_rental_income": 8000  # månedlig
            }
            
            rental_potential["suggested_solutions"].append(solution)
            rental_potential["estimated_cost"] = solution["estimated_cost"]
            rental_potential["estimated_rental_income"] = solution["estimated_rental_income"]
            rental_potential["roi_per_month"] = solution["estimated_rental_income"] / solution["estimated_cost"]
            rental_potential["requirements_met"]["separate_entrance"] = True
            rental_potential["requirements_met"]["minimum_size"] = True
            
        # Scenario 3: Bod/rom i tilknytning til bad som kan utvides til hybel
        bathroom_adjacent_rooms = self._find_adjacent_rooms(rooms, "bathroom")
        potentially_convertible = [r for r in bathroom_adjacent_rooms if rooms.get(r, {}).get("area", 0) > 10]
        
        if potentially_convertible:
            rental_potential["has_potential"] = True
            
            solution = {
                "title": f"Konverter {potentially_convertible[0]} til hybel",
                "description": f"Rommet ligger i tilknytning til bad og kan konverteres til hybel med minimale endringer.",
                "estimated_cost": 25000, # Lav kostnad siden det er i tilknytning til bad
                "estimated_time": "1-2 uker",
                "steps": [
                    "Installer minikjøkken",
                    "Etabler separat inngang hvis mulig",
                    "Vurder om badet må deles eller om egen tilgang må etableres"
                ],
                "requirements": [
                    "Avklaring med kommune om krav til brannsikring og bod"
                ],
                "estimated_rental_income": 4000  # månedlig
            }
            
            rental_potential["suggested_solutions"].append(solution)
            if not rental_potential["estimated_cost"] or solution["estimated_cost"] < rental_potential["estimated_cost"]:
                rental_potential["estimated_cost"] = solution["estimated_cost"]
                rental_potential["estimated_rental_income"] = solution["estimated_rental_income"]
                rental_potential["roi_per_month"] = solution["estimated_rental_income"] / solution["estimated_cost"]
            rental_potential["requirements_met"]["bathroom"] = True
            
        # Beregn lønnsomhet
        if rental_potential["has_potential"]:
            # Sorter løsninger etter ROI (avkastning per krone investert)
            rental_potential["suggested_solutions"].sort(
                key=lambda x: x["estimated_rental_income"] / x["estimated_cost"],
                reverse=True
            )
            
            # Bruk den mest lønnsomme løsningen for total ROI
            best_solution = rental_potential["suggested_solutions"][0]
            rental_potential["estimated_cost"] = best_solution["estimated_cost"]
            rental_potential["estimated_rental_income"] = best_solution["estimated_rental_income"]
            rental_potential["roi_per_month"] = best_solution["estimated_rental_income"] / best_solution["estimated_cost"]
            rental_potential["payback_months"] = round(best_solution["estimated_cost"] / best_solution["estimated_rental_income"])
            
            # Legg til juridisk informasjon og krav
            rental_potential["legal_requirements"] = [
                "Utleiedelen må ha egen inngang",
                "Brannsikring må være i henhold til TEK17",
                "Minimum takhøyde 2,2 meter i oppholdsrom",
                "Ventilasjon i samsvar med gjeldende krav",
                "Rommet må ha vindu med tilstrekkelig lysflate"
            ]
            
        return rental_potential
    
    def _find_adjacent_rooms(self, rooms: Dict[str, Any], target_room_type: str) -> List[str]:
        """Finn rom som grenser til et spesifikt rom basert på posisjonsdataene."""
        adjacent_rooms = []
        target_rooms = [name for name, data in rooms.items() if target_room_type in name.lower()]
        
        if not target_rooms:
            return []
            
        target_room = target_rooms[0]
        target_pos = rooms[target_room]["position"]
        
        for name, data in rooms.items():
            if name == target_room:
                continue
                
            pos = data["position"]
            
            # Sjekk om rommene er på samme etasje
            if pos["floor"] != target_pos["floor"]:
                continue
                
            # Sjekk om rommene grenser til hverandre
            is_adjacent = (
                (pos["x"] + pos["width"] >= target_pos["x"] and pos["x"] <= target_pos["x"] + target_pos["width"]) and
                (pos["y"] + pos["height"] >= target_pos["y"] and pos["y"] <= target_pos["y"] + target_pos["height"])
            )
            
            if is_adjacent:
                adjacent_rooms.append(name)
                
        return adjacent_rooms
    
    def generate_renovation_plan(self, floor_plan_analysis: Dict[str, Any], budget: float = None) -> Dict[str, Any]:
        """
        Genererer detaljert renoveringsplan for å etablere utleiedel innenfor gitt budsjett.
        
        Args:
            floor_plan_analysis: Resultatet fra analyze-metoden
            budget: Maksimalt budsjett tilgjengelig
            
        Returns:
            Dict med renoveringsplan
        """
        rental_potential = floor_plan_analysis.get("rental_potential", {})
        if not rental_potential.get("has_potential", False):
            return {
                "message": "Boligen egner seg ikke for enkel etablering av utleiedel.",
                "reason": "Minstekrav for areal eller romløsning er ikke oppfylt."
            }
            
        # Filtrer løsninger basert på budsjett
        suitable_solutions = []
        if budget:
            suitable_solutions = [
                s for s in rental_potential.get("suggested_solutions", [])
                if s.get("estimated_cost", float('inf')) <= budget
            ]
        else:
            suitable_solutions = rental_potential.get("suggested_solutions", [])
            
        if not suitable_solutions:
            return {
                "message": "Ingen løsninger innenfor budsjett",
                "min_required_budget": min([s.get("estimated_cost", 0) for s in rental_potential.get("suggested_solutions", [])]),
                "all_solutions": rental_potential.get("suggested_solutions", [])
            }
            
        # Velg den mest lønnsomme løsningen innenfor budsjettet
        chosen_solution = max(suitable_solutions, key=lambda s: s.get("estimated_rental_income", 0) / s.get("estimated_cost", 1))
        
        # Lag detaljert plan
        detailed_plan = {
            "title": chosen_solution["title"],
            "description": chosen_solution["description"],
            "total_cost": chosen_solution["estimated_cost"],
            "timeline": chosen_solution["estimated_time"],
            "estimated_monthly_income": chosen_solution["estimated_rental_income"],
            "payback_period_months": round(chosen_solution["estimated_cost"] / chosen_solution["estimated_rental_income"]),
            "roi_monthly": chosen_solution["estimated_rental_income"] / chosen_solution["estimated_cost"],
            "roi_annual": 12 * chosen_solution["estimated_rental_income"] / chosen_solution["estimated_cost"],
            "steps": chosen_solution["steps"],
            "material_costs": self._estimate_materials(chosen_solution),
            "labor_costs": self._estimate_labor(chosen_solution),
            "permits_required": self._estimate_permits(chosen_solution),
            "potential_challenges": self._identify_challenges(chosen_solution),
            "legal_requirements": rental_potential.get("legal_requirements", [])
        }
        
        return detailed_plan
        
    def _estimate_materials(self, solution: Dict[str, Any]) -> Dict[str, float]:
        """Estimerer materialkostnader basert på løsningen."""
        # Forenklet estimat basert på løsningstype
        if "Del stuen" in solution["title"]:
            return {
                "Skillevegg materialer": 7000,
                "Dør og karm": 3500,
                "Elektrikermateriell": 2500,
                "Minikjøkken": 12000,
                "Maling og overflatebehandling": 2000
            }
        elif "etasje som utleiedel" in solution["title"]:
            return {
                "Brannskille materialer": 9000,
                "Dør og karm": 3500,
                "Kjøkkenløsning": 20000,
                "Elektrikermateriell": 5000,
                "Maling og overflatebehandling": 3000
            }
        else:
            return {
                "Minikjøkken": 10000,
                "Elektrikermateriell": 2000,
                "Dør og karm": 3500,
                "Maling og overflatebehandling": 1500
            }
    
    def _estimate_labor(self, solution: Dict[str, Any]) -> Dict[str, float]:
        """Estimerer arbeidskostnader basert på løsningen."""
        if "Del stuen" in solution["title"]:
            return {
                "Snekkerarbeid": 5000,
                "Elektrikerarbeid": 4000,
                "Maler/overflatebehandling": 3000
            }
        elif "etasje som utleiedel" in solution["title"]:
            return {
                "Snekkerarbeid": 10000,
                "Elektrikerarbeid": 8000,
                "Rørleggerarbeid": 5000,
                "Maler/overflatebehandling": 4000
            }
        else:
            return {
                "Snekkerarbeid": 3000,
                "Elektrikerarbeid": 3000,
                "Maler/overflatebehandling": 2000
            }
    
    def _estimate_permits(self, solution: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Estimerer nødvendige tillatelser."""
        return [
            {
                "name": "Søknad om bruksendring",
                "estimated_cost": 3000,
                "processing_time": "4-6 uker",
                "requirements": ["Plantegning før og etter", "Brannteknisk dokumentasjon"]
            },
            {
                "name": "Nabovarsel",
                "estimated_cost": 0,
                "processing_time": "2 uker",
                "requirements": ["Varsling av alle naboer"]
            }
        ]
    
    def _identify_challenges(self, solution: Dict[str, Any]) -> List[str]:
        """Identifiserer potensielle utfordringer med løsningen."""
        challenges = [
            "Støy mellom hovedbolig og utleiedel",
            "Krav til brannsikring kan øke kostnaden",
            "Begrenset plass kan gi utfordringer med minimumskrav"
        ]
        
        if "kjeller" in solution.get("description", "").lower():
            challenges.append("Kjelleretasjer kan ha utfordringer med takhøyde og lysforhold")
            challenges.append("Fuktproblematikk må vurderes nøye")
            
        return challenges 