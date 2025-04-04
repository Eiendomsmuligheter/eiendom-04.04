"""
CommuneConnect - Modul for å hente kommunal informasjon og reguleringsdata.
Denne modulen kobler seg til kommunale API-er og datasett for å hente
oppdatert informasjon om reguleringsplaner, eiendomsgrenser,
kommuneplaner og annen relevant informasjon.
"""

import os
import logging
import json
import random
from datetime import datetime
from typing import Dict, List, Any, Optional

# Sett opp logging
logger = logging.getLogger(__name__)

class CommuneConnect:
    """Hovedklasse for kommunal datahenting"""
    
    def __init__(self):
        """Initialiserer CommuneConnect med tilkoblinger til data"""
        logger.info("Initialiserer CommuneConnect")
        self.api_ready = True
        
        # Simulerte kommuneplaner og reguleringsdata
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
        
        # Simulerte reguleringsplaner
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
        
        # Simulerte byggesaksprosesser
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
            # Flere kommuner kan legges til etter behov
        }
    
    def get_kommuneplan(self, municipality_id: str) -> Dict[str, Any]:
        """Henter kommuneplansinformasjon for en gitt kommune"""
        logger.info(f"Henter kommuneplan for kommune {municipality_id}")
        
        # Sjekk om vi har data for kommunen
        if municipality_id not in self.kommune_planer:
            logger.warning(f"Ingen kommuneplandata for kommune {municipality_id}")
            return {"error": "Kommuneplan ikke funnet", "municipality_id": municipality_id}
        
        return self.kommune_planer[municipality_id]
    
    def get_reguleringsplaner(self, municipality_id: str, area_name: Optional[str] = None) -> Dict[str, Any]:
        """Henter reguleringsplaner for en gitt kommune og eventuelt område"""
        logger.info(f"Henter reguleringsplaner for kommune {municipality_id}, område: {area_name}")
        
        # Sjekk om vi har data for kommunen
        if municipality_id not in self.reguleringsplaner:
            logger.warning(f"Ingen reguleringsplaner for kommune {municipality_id}")
            return {"error": "Reguleringsplaner ikke funnet", "municipality_id": municipality_id}
        
        # Hvis område er spesifisert, returner kun det området
        if area_name and area_name in self.reguleringsplaner[municipality_id]:
            return {area_name: self.reguleringsplaner[municipality_id][area_name]}
        
        return self.reguleringsplaner[municipality_id]
    
    def get_byggesak_info(self, municipality_id: str, process_type: Optional[str] = None) -> Dict[str, Any]:
        """Henter informasjon om byggesaksprosesser"""
        logger.info(f"Henter byggesaksinformasjon for kommune {municipality_id}, type: {process_type}")
        
        # Sjekk om vi har data for kommunen
        if municipality_id not in self.byggesak_prosesser:
            logger.warning(f"Ingen byggesaksinformasjon for kommune {municipality_id}")
            return {"error": "Byggesaksinformasjon ikke funnet", "municipality_id": municipality_id}
        
        # Hvis prosesstype er spesifisert, returner kun den typen
        if process_type and process_type in self.byggesak_prosesser[municipality_id]:
            return {process_type: self.byggesak_prosesser[municipality_id][process_type]}
        
        return self.byggesak_prosesser[municipality_id]
    
    def get_property_regulations(self, address: str, municipality_id: Optional[str] = None) -> Dict[str, Any]:
        """Henter reguleringsbestemmelser for en gitt eiendom"""
        logger.info(f"Henter reguleringsbestemmelser for eiendom: {address}")
        
        # Hvis kommune-ID ikke er oppgitt, forsøk å utlede fra adresse (forenklet)
        if not municipality_id:
            # Enkel måte å tildele en kommune basert på tilfeldige kriterier
            # I en reell implementasjon ville dette baseres på geolokalisering
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
                    municipality_id = "0301"  # Default til Oslo
            else:
                municipality_id = "0301"  # Default til Oslo
        
        # Hent kommuneplan
        kommune_plan = self.get_kommuneplan(municipality_id)
        
        # Velg en tilfeldig reguleringsplan for kommunen (forenklet)
        if municipality_id in self.reguleringsplaner:
            area_keys = list(self.reguleringsplaner[municipality_id].keys())
            if area_keys:
                selected_area = random.choice(area_keys)
                regulering = self.reguleringsplaner[municipality_id][selected_area]
            else:
                regulering = {"error": "Ingen reguleringsplaner funnet for kommunen"}
        else:
            regulering = {"error": "Ingen reguleringsplaner funnet for kommunen"}
        
        # Kombiner data
        result = {
            "eiendom": {
                "adresse": address,
                "kommune_id": municipality_id,
                "kommune_navn": kommune_plan.get("kommune_navn", "Ukjent kommune")
            },
            "kommuneplan": {
                "navn": kommune_plan.get("kommuneplan_navn", "Ukjent kommuneplan"),
                "periode": kommune_plan.get("plan_perioder", ["Ukjent"])[0],
                "hovedfokus": kommune_plan.get("hovedfokus", ["Ukjent"]),
                "spesielle_hensyn": kommune_plan.get("spesielle_hensyn", ["Ingen"])
            },
            "reguleringsplan": regulering if not isinstance(regulering, dict) or "error" not in regulering else {
                "navn": "Ingen gjeldende reguleringsplan",
                "plan_id": "N/A",
                "formål": "Følg kommuneplan",
                "utnyttelsesgrad": 0.0,
                "maks_høyde": 0.0,
                "bestemmelser": ["Følg kommuneplan"]
            },
            "byggesak": {
                "prosesser": list(self.byggesak_prosesser.get(municipality_id, {}).keys()),
                "kontaktinfo": {
                    "avdeling": "Byggesaksavdelingen, " + kommune_plan.get("kommune_navn", "Ukjent kommune"),
                    "epost": "byggesak@" + kommune_plan.get("kommune_navn", "kommune").lower().replace(" ", "") + ".kommune.no",
                    "telefon": "12345678"
                }
            }
        }
        
        return result 