import os
import numpy as np
import cv2
import json
from typing import Dict, List, Tuple, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImprovedFloorPlanAnalyzer:
    """
    Enhanced floor plan analyzer that takes into account municipal requirements
    and cost-effectiveness for rental unit creation.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the improved floor plan analyzer.
        
        Args:
            config_path: Path to configuration file with municipal requirements and cost data
        """
        self.config = self._load_config(config_path)
        self.municipal_requirements = self.config.get('municipal_requirements', {})
        self.cost_data = self.config.get('cost_data', {})
        self.min_rental_area = self.config.get('min_rental_area', 25)  # Minimum area in m²
        self.model_loaded = False
        
        # Initialize detection models
        self._init_models()
        
        logger.info("Improved Floor Plan Analyzer initialized")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """
        Load configuration from file or use defaults.
        
        Args:
            config_path: Path to configuration file
            
        Returns:
            Configuration dictionary
        """
        default_config = {
            'municipal_requirements': {
                'oslo': {
                    'min_ceiling_height': 2.2,
                    'min_window_area': 0.1,  # 10% of floor area
                    'separate_entrance': True,
                    'bathroom_required': True,
                    'kitchen_required': True,
                    'min_room_count': 1,
                    'fire_safety': ['smoke_detector', 'fire_extinguisher'],
                    'ventilation': True,
                    'sound_insulation': True
                },
                'bergen': {
                    'min_ceiling_height': 2.2,
                    'min_window_area': 0.1,
                    'separate_entrance': True,
                    'bathroom_required': True,
                    'kitchen_required': True,
                    'min_room_count': 1,
                    'fire_safety': ['smoke_detector', 'fire_extinguisher'],
                    'ventilation': True,
                    'sound_insulation': True
                },
                'trondheim': {
                    'min_ceiling_height': 2.4,
                    'min_window_area': 0.1,
                    'separate_entrance': True,
                    'bathroom_required': True,
                    'kitchen_required': True,
                    'min_room_count': 1,
                    'fire_safety': ['smoke_detector', 'fire_extinguisher'],
                    'ventilation': True,
                    'sound_insulation': True
                },
                'stavanger': {
                    'min_ceiling_height': 2.2,
                    'min_window_area': 0.1,
                    'separate_entrance': True,
                    'bathroom_required': True,
                    'kitchen_required': True,
                    'min_room_count': 1,
                    'fire_safety': ['smoke_detector', 'fire_extinguisher'],
                    'ventilation': True,
                    'sound_insulation': True
                }
            },
            'cost_data': {
                'wall_construction': {
                    'per_meter': 2500,  # NOK per meter
                    'sound_insulated_extra': 1000  # Extra cost for sound insulation
                },
                'door_installation': {
                    'interior': 5000,  # NOK per door
                    'exterior': 15000  # NOK per exterior door
                },
                'window_installation': 12000,  # NOK per window
                'bathroom_installation': {
                    'small': 80000,  # Small bathroom (up to 4 m²)
                    'medium': 120000,  # Medium bathroom (4-6 m²)
                    'large': 180000  # Large bathroom (6+ m²)
                },
                'kitchen_installation': {
                    'small': 50000,  # Small kitchen (up to 6 m²)
                    'medium': 80000,  # Medium kitchen (6-10 m²)
                    'large': 120000  # Large kitchen (10+ m²)
                },
                'electrical_work': 25000,  # Base cost
                'plumbing_work': 30000,  # Base cost
                'flooring': {
                    'per_sqm': 1200  # NOK per m²
                },
                'painting': {
                    'per_sqm': 400  # NOK per m²
                },
                'permits': 15000  # Base cost for permits
            },
            'min_rental_area': 25,  # Minimum area in m²
            'rental_income_data': {
                'oslo': {
                    'per_sqm': 250  # NOK per m² per month
                },
                'bergen': {
                    'per_sqm': 200  # NOK per m² per month
                },
                'trondheim': {
                    'per_sqm': 180  # NOK per m² per month
                },
                'stavanger': {
                    'per_sqm': 170  # NOK per m² per month
                }
            }
        }
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    # Merge with defaults
                    for key, value in default_config.items():
                        if key not in config:
                            config[key] = value
                        elif isinstance(value, dict) and isinstance(config[key], dict):
                            for subkey, subvalue in value.items():
                                if subkey not in config[key]:
                                    config[key][subkey] = subvalue
                return config
            except Exception as e:
                logger.error(f"Error loading config from {config_path}: {e}")
                return default_config
        else:
            logger.info("Using default configuration")
            return default_config
    
    def _init_models(self):
        """
        Initialize the computer vision models for floor plan analysis.
        In a real implementation, this would load trained models.
        """
        try:
            # Placeholder for model initialization
            # In a real implementation, this would load models like:
            # self.room_detector = load_model('path/to/room_detection_model')
            # self.wall_detector = load_model('path/to/wall_detection_model')
            # self.door_window_detector = load_model('path/to/door_window_model')
            
            # For now, we'll just set a flag
            self.model_loaded = True
            logger.info("Models initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            self.model_loaded = False
    
    def analyze_floor_plan(self, image_path: str, municipality: str = 'oslo') -> Dict[str, Any]:
        """
        Analyze a floor plan image and identify potential rental unit opportunities.
        
        Args:
            image_path: Path to the floor plan image
            municipality: Municipality name for specific requirements
            
        Returns:
            Analysis results including potential rental units and cost estimates
        """
        if not self.model_loaded:
            logger.error("Models not loaded, cannot analyze floor plan")
            return {'error': 'Models not loaded'}
        
        if not os.path.exists(image_path):
            logger.error(f"Image file not found: {image_path}")
            return {'error': 'Image file not found'}
        
        try:
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Failed to load image: {image_path}")
                return {'error': 'Failed to load image'}
            
            # Get municipal requirements for the specified municipality
            muni_reqs = self.municipal_requirements.get(municipality.lower(), 
                                                       self.municipal_requirements['oslo'])
            
            # Analyze the floor plan
            # In a real implementation, this would use the loaded models to detect
            # rooms, walls, doors, windows, etc.
            
            # For this implementation, we'll simulate the analysis
            analysis_result = self._simulate_floor_plan_analysis(image, muni_reqs)
            
            # Generate rental unit proposals
            rental_proposals = self._generate_rental_proposals(analysis_result, muni_reqs, municipality)
            
            # Calculate costs and ROI
            financial_analysis = self._calculate_costs_and_roi(rental_proposals, municipality)
            
            # Combine results
            result = {
                'original_analysis': analysis_result,
                'rental_proposals': rental_proposals,
                'financial_analysis': financial_analysis,
                'municipal_compliance': self._check_municipal_compliance(rental_proposals, muni_reqs)
            }
            
            logger.info(f"Floor plan analysis completed for {image_path}")
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing floor plan: {e}")
            return {'error': f'Analysis failed: {str(e)}'}
    
    def _simulate_floor_plan_analysis(self, image: np.ndarray, muni_reqs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate floor plan analysis for demonstration purposes.
        In a real implementation, this would use computer vision models.
        
        Args:
            image: Floor plan image as numpy array
            muni_reqs: Municipal requirements
            
        Returns:
            Simulated analysis results
        """
        # Get image dimensions
        height, width, _ = image.shape
        
        # Calculate scale (assuming 1 pixel = 2 cm)
        scale = 0.02  # meters per pixel
        
        # Calculate total area
        total_area_pixels = width * height
        total_area_sqm = total_area_pixels * scale * scale
        
        # Simulate room detection
        # In a real implementation, this would use a trained model
        rooms = [
            {
                'id': 'room1',
                'type': 'living_room',
                'area': total_area_sqm * 0.3,
                'position': {'x': width * 0.1, 'y': height * 0.1},
                'dimensions': {'width': width * 0.4, 'height': height * 0.4}
            },
            {
                'id': 'room2',
                'type': 'kitchen',
                'area': total_area_sqm * 0.15,
                'position': {'x': width * 0.6, 'y': height * 0.1},
                'dimensions': {'width': width * 0.3, 'height': height * 0.3}
            },
            {
                'id': 'room3',
                'type': 'bedroom',
                'area': total_area_sqm * 0.2,
                'position': {'x': width * 0.1, 'y': height * 0.6},
                'dimensions': {'width': width * 0.3, 'height': height * 0.3}
            },
            {
                'id': 'room4',
                'type': 'bathroom',
                'area': total_area_sqm * 0.1,
                'position': {'x': width * 0.5, 'y': height * 0.5},
                'dimensions': {'width': width * 0.2, 'height': height * 0.2}
            },
            {
                'id': 'room5',
                'type': 'hallway',
                'area': total_area_sqm * 0.1,
                'position': {'x': width * 0.4, 'y': height * 0.4},
                'dimensions': {'width': width * 0.2, 'height': height * 0.4}
            }
        ]
        
        # Simulate wall detection
        walls = [
            {
                'id': 'wall1',
                'start': {'x': 0, 'y': 0},
                'end': {'x': width, 'y': 0},
                'is_exterior': True
            },
            {
                'id': 'wall2',
                'start': {'x': width, 'y': 0},
                'end': {'x': width, 'y': height},
                'is_exterior': True
            },
            {
                'id': 'wall3',
                'start': {'x': width, 'y': height},
                'end': {'x': 0, 'y': height},
                'is_exterior': True
            },
            {
                'id': 'wall4',
                'start': {'x': 0, 'y': height},
                'end': {'x': 0, 'y': 0},
                'is_exterior': True
            },
            {
                'id': 'wall5',
                'start': {'x': width * 0.5, 'y': 0},
                'end': {'x': width * 0.5, 'y': height * 0.7},
                'is_exterior': False
            },
            {
                'id': 'wall6',
                'start': {'x': 0, 'y': height * 0.5},
                'end': {'x': width * 0.7, 'y': height * 0.5},
                'is_exterior': False
            }
        ]
        
        # Simulate door and window detection
        openings = [
            {
                'id': 'door1',
                'type': 'door',
                'position': {'x': width * 0.1, 'y': 0},
                'dimensions': {'width': width * 0.05, 'height': height * 0.1},
                'is_exterior': True
            },
            {
                'id': 'door2',
                'type': 'door',
                'position': {'x': width * 0.4, 'y': height * 0.5},
                'dimensions': {'width': width * 0.05, 'height': height * 0.1},
                'is_exterior': False
            },
            {
                'id': 'window1',
                'type': 'window',
                'position': {'x': width * 0.3, 'y': 0},
                'dimensions': {'width': width * 0.1, 'height': height * 0.05},
                'is_exterior': True
            },
            {
                'id': 'window2',
                'type': 'window',
                'position': {'x': width, 'y': height * 0.3},
                'dimensions': {'width': width * 0.05, 'height': height * 0.1},
                'is_exterior': True
            }
        ]
        
        return {
            'dimensions': {
                'width': width,
                'height': height,
                'scale': scale,
                'total_area': total_area_sqm
            },
            'rooms': rooms,
            'walls': walls,
            'openings': openings
        }
    
    def _generate_rental_proposals(self, analysis: Dict[str, Any], 
                                  muni_reqs: Dict[str, Any],
                                  municipality: str) -> List[Dict[str, Any]]:
        """
        Generate proposals for rental units based on the floor plan analysis.
        
        Args:
            analysis: Floor plan analysis results
            muni_reqs: Municipal requirements
            municipality: Municipality name
            
        Returns:
            List of rental unit proposals
        """
        proposals = []
        
        # Get total area
        total_area = analysis['dimensions']['total_area']
        
        # Determine potential rental unit sizes
        # For simplicity, we'll create proposals for different percentages of the total area
        potential_sizes = [
            {'percentage': 0.3, 'description': 'Small rental unit'},
            {'percentage': 0.4, 'description': 'Medium rental unit'},
            {'percentage': 0.5, 'description': 'Large rental unit'}
        ]
        
        for size in potential_sizes:
            area = total_area * size['percentage']
            
            # Skip if area is too small
            if area < self.min_rental_area:
                continue
            
            # Determine number of rooms based on area
            if area < 40:
                rooms = 1
                room_types = ['combined_living_kitchen', 'bathroom']
            elif area < 60:
                rooms = 2
                room_types = ['living_room', 'bedroom', 'kitchen', 'bathroom']
            else:
                rooms = 3
                room_types = ['living_room', 'bedroom', 'bedroom2', 'kitchen', 'bathroom']
            
            # Calculate estimated rental income
            rental_income = self._estimate_rental_income(area, municipality)
            
            # Create proposal
            proposal = {
                'id': f"proposal_{size['percentage']}",
                'description': size['description'],
                'area': area,
                'rooms': rooms,
                'room_types': room_types,
                'estimated_rental_income': rental_income,
                'modifications': self._generate_modifications(analysis, area, rooms, muni_reqs)
            }
            
            proposals.append(proposal)
        
        # Sort proposals by cost-effectiveness (ROI)
        proposals.sort(key=lambda p: p['estimated_rental_income'] / 
                      sum(mod['estimated_cost'] for mod in p['modifications']))
        
        return proposals
    
    def _generate_modifications(self, analysis: Dict[str, Any], 
                               area: float, rooms: int, 
                               muni_reqs: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate necessary modifications to create a rental unit.
        
        Args:
            analysis: Floor plan analysis
            area: Proposed rental unit area
            rooms: Number of rooms in the proposed unit
            muni_reqs: Municipal requirements
            
        Returns:
            List of necessary modifications
        """
        modifications = []
        
        # Check if we need to add a separate entrance
        if muni_reqs['separate_entrance']:
            exterior_doors = [o for o in analysis['openings'] 
                             if o['type'] == 'door' and o['is_exterior']]
            
            if len(exterior_doors) < 2:
                # Need to add a new exterior door
                modifications.append({
                    'type': 'add_exterior_door',
                    'description': 'Add separate entrance for rental unit',
                    'estimated_cost': self.cost_data['door_installation']['exterior']
                })
        
        # Check if we need to add a bathroom
        if muni_reqs['bathroom_required']:
            bathrooms = [r for r in analysis['rooms'] if r['type'] == 'bathroom']
            
            if len(bathrooms) < 2:
                # Need to add a new bathroom
                bathroom_size = min(6, area * 0.15)  # 15% of area or max 6 m²
                
                if bathroom_size < 4:
                    bathroom_cost = self.cost_data['bathroom_installation']['small']
                elif bathroom_size < 6:
                    bathroom_cost = self.cost_data['bathroom_installation']['medium']
                else:
                    bathroom_cost = self.cost_data['bathroom_installation']['large']
                
                modifications.append({
                    'type': 'add_bathroom',
                    'description': f'Add new bathroom ({bathroom_size:.1f} m²)',
                    'estimated_cost': bathroom_cost,
                    'area': bathroom_size
                })
        
        # Check if we need to add a kitchen
        if muni_reqs['kitchen_required']:
            kitchens = [r for r in analysis['rooms'] if r['type'] == 'kitchen']
            
            if len(kitchens) < 2:
                # Need to add a new kitchen
                kitchen_size = min(10, area * 0.2)  # 20% of area or max 10 m²
                
                if kitchen_size < 6:
                    kitchen_cost = self.cost_data['kitchen_installation']['small']
                elif kitchen_size < 10:
                    kitchen_cost = self.cost_data['kitchen_installation']['medium']
                else:
                    kitchen_cost = self.cost_data['kitchen_installation']['large']
                
                modifications.append({
                    'type': 'add_kitchen',
                    'description': f'Add new kitchen ({kitchen_size:.1f} m²)',
                    'estimated_cost': kitchen_cost,
                    'area': kitchen_size
                })
        
        # Add dividing walls
        # Estimate wall length based on area
        wall_length = np.sqrt(area) * 2  # Simplified estimation
        
        modifications.append({
            'type': 'add_walls',
            'description': f'Add dividing walls ({wall_length:.1f} m)',
            'estimated_cost': wall_length * self.cost_data['wall_construction']['per_meter'] +
                             (self.cost_data['wall_construction']['sound_insulated_extra'] * wall_length 
                              if muni_reqs['sound_insulation'] else 0)
        })
        
        # Add interior doors
        interior_doors_needed = rooms - 1  # Simplified estimation
        
        if interior_doors_needed > 0:
            modifications.append({
                'type': 'add_interior_doors',
                'description': f'Add {interior_doors_needed} interior doors',
                'estimated_cost': interior_doors_needed * self.cost_data['door_installation']['interior']
            })
        
        # Add electrical work
        modifications.append({
            'type': 'electrical_work',
            'description': 'Electrical installations for rental unit',
            'estimated_cost': self.cost_data['electrical_work'] + (area * 200)  # Base + per m²
        })
        
        # Add plumbing work
        modifications.append({
            'type': 'plumbing_work',
            'description': 'Plumbing installations for rental unit',
            'estimated_cost': self.cost_data['plumbing_work'] + (area * 150)  # Base + per m²
        })
        
        # Add flooring
        modifications.append({
            'type': 'flooring',
            'description': f'New flooring for rental unit ({area:.1f} m²)',
            'estimated_cost': area * self.cost_data['flooring']['per_sqm']
        })
        
        # Add painting
        modifications.append({
            'type': 'painting',
            'description': f'Painting for rental unit ({area:.1f} m²)',
            'estimated_cost': area * self.cost_data['painting']['per_sqm']
        })
        
        # Add permits
        modifications.append({
            'type': 'permits',
            'description': 'Building permits and documentation',
            'estimated_cost': self.cost_data['permits']
        })
        
        return modifications
    
    def _calculate_costs_and_roi(self, proposals: List[Dict[str, Any]], 
                                municipality: str) -> Dict[str, Any]:
        """
        Calculate costs and return on investment for each proposal.
        
        Args:
            proposals: List of rental unit proposals
            municipality: Municipality name
            
        Returns:
            Financial analysis results
        """
        results = []
        
        for proposal in proposals:
            # Calculate total cost
            total_cost = sum(mod['estimated_cost'] for mod in proposal['modifications'])
            
            # Get monthly rental income
            monthly_income = proposal['estimated_rental_income']
            annual_income = monthly_income * 12
            
            # Calculate ROI
            roi_percentage = (annual_income / total_cost) * 100
            payback_period = total_cost / annual_income  # Years
            
            # Calculate 5-year and 10-year profit
            five_year_profit = (annual_income * 5) - total_cost
            ten_year_profit = (annual_income * 10) - total_cost
            
            result = {
                'proposal_id': proposal['id'],
                'total_cost': total_cost,
                'monthly_income': monthly_income,
                'annual_income': annual_income,
                'roi_percentage': roi_percentage,
                'payback_period': payback_period,
                'five_year_profit': five_year_profit,
                'ten_year_profit': ten_year_profit
            }
            
            results.append(result)
        
        # Find the most cost-effective proposal
        if results:
            most_cost_effective = max(results, key=lambda r: r['roi_percentage'])
            
            return {
                'proposals': results,
                'most_cost_effective': most_cost_effective,
                'summary': {
                    'cost_range': {
                        'min': min(r['total_cost'] for r in results),
                        'max': max(r['total_cost'] for r in results)
                    },
                    'roi_range': {
                        'min': min(r['roi_percentage'] for r in results),
                        'max': max(r['roi_percentage'] for r in results)
                    },
                    'payback_range': {
                        'min': min(r['payback_period'] for r in results),
                        'max': max(r['payback_period'] for r in results)
                    }
                }
            }
        else:
            return {
                'proposals': [],
                'summary': {
                    'cost_range': {'min': 0, 'max': 0},
                    'roi_range': {'min': 0, 'max': 0},
                    'payback_range': {'min': 0, 'max': 0}
                }
            }
    
    def _check_municipal_compliance(self, proposals: List[Dict[str, Any]], 
                                   muni_reqs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check if proposals comply with municipal requirements.
        
        Args:
            proposals: List of rental unit proposals
            muni_reqs: Municipal requirements
            
        Returns:
            Compliance check results
        """
        results = []
        
        for proposal in proposals:
            requirements_met = []
            requirements_pending = []
            
            # Check separate entrance
            if muni_reqs['separate_entrance']:
                if any(mod['type'] == 'add_exterior_door' for mod in proposal['modifications']):
                    requirements_pending.append({
                        'id': 'separate_entrance',
                        'name': 'Separate entrance',
                        'status': 'pending',
                        'description': 'Separate entrance needs to be added'
                    })
                else:
                    requirements_met.append({
                        'id': 'separate_entrance',
                        'name': 'Separate entrance',
                        'status': 'fulfilled',
                        'description': 'Property already has multiple entrances'
                    })
            
            # Check bathroom
            if muni_reqs['bathroom_required']:
                if any(mod['type'] == 'add_bathroom' for mod in proposal['modifications']):
                    requirements_pending.append({
                        'id': 'bathroom',
                        'name': 'Bathroom',
                        'status': 'pending',
                        'description': 'Bathroom needs to be added'
                    })
                else:
                    requirements_met.append({
                        'id': 'bathroom',
                        'name': 'Bathroom',
                        'status': 'fulfilled',
                        'description': 'Property already has multiple bathrooms'
                    })
            
            # Check kitchen
            if muni_reqs['kitchen_required']:
                if any(mod['type'] == 'add_kitchen' for mod in proposal['modifications']):
                    requirements_pending.append({
                        'id': 'kitchen',
                        'name': 'Kitchen',
                        'status': 'pending',
                        'description': 'Kitchen needs to be added'
                    })
                else:
                    requirements_met.append({
                        'id': 'kitchen',
                        'name': 'Kitchen',
                        'status': 'fulfilled',
                        'description': 'Property already has multiple kitchens'
                    })
            
            # Check minimum room count
            if proposal['rooms'] >= muni_reqs['min_room_count']:
                requirements_met.append({
                    'id': 'min_room_count',
                    'name': 'Minimum room count',
                    'status': 'fulfilled',
                    'description': f"Rental unit has {proposal['rooms']} rooms"
                })
            else:
                requirements_pending.append({
                    'id': 'min_room_count',
                    'name': 'Minimum room count',
                    'status': 'pending',
                    'description': f"Rental unit needs at least {muni_reqs['min_room_count']} rooms"
                })
            
            # Check sound insulation
            if muni_reqs['sound_insulation']:
                requirements_pending.append({
                    'id': 'sound_insulation',
                    'name': 'Sound insulation',
                    'status': 'pending',
                    'description': 'Sound insulation needs to be added between units'
                })
            
            # Check fire safety
            if 'fire_safety' in muni_reqs and muni_reqs['fire_safety']:
                requirements_pending.append({
                    'id': 'fire_safety',
                    'name': 'Fire safety',
                    'status': 'pending',
                    'description': 'Fire safety equipment needs to be installed'
                })
            
            # Check ventilation
            if muni_reqs['ventilation']:
                requirements_pending.append({
                    'id': 'ventilation',
                    'name': 'Ventilation',
                    'status': 'pending',
                    'description': 'Proper ventilation needs to be ensured'
                })
            
            # Check ceiling height (assume it's met for now)
            requirements_met.append({
                'id': 'ceiling_height',
                'name': 'Ceiling height',
                'status': 'fulfilled',
                'description': f"Ceiling height meets the minimum requirement of {muni_reqs['min_ceiling_height']} m"
            })
            
            result = {
                'proposal_id': proposal['id'],
                'requirements_met': requirements_met,
                'requirements_pending': requirements_pending,
                'all_requirements_met': len(requirements_pending) == 0
            }
            
            results.append(result)
        
        return {
            'proposal_compliance': results,
            'summary': {
                'fully_compliant': any(r['all_requirements_met'] for r in results),
                'partially_compliant': all(len(r['requirements_met']) > 0 for r in results)
            }
        }
    
    def _estimate_rental_income(self, area: float, municipality: str) -> float:
        """
        Estimate monthly rental income based on area and location.
        
        Args:
            area: Rental unit area in m²
            municipality: Municipality name
            
        Returns:
            Estimated monthly rental income
        """
        # Get rental income data for the municipality
        rental_data = self.config.get('rental_income_data', {}).get(municipality.lower())
        
        if not rental_data:
            # Use Oslo as default
            rental_data = self.config.get('rental_income_data', {}).get('oslo')
        
        # Calculate base rental income
        base_income = area * rental_data['per_sqm']
        
        # Apply adjustments based on area
        if area < 30:
            # Small units have higher per m² price
            adjustment = 1.2
        elif area < 50:
            adjustment = 1.1
        elif area < 80:
            adjustment = 1.0
        else:
            # Larger units have lower per m² price
            adjustment = 0.9
        
        return base_income * adjustment

# Example usage
if __name__ == "__main__":
    analyzer = ImprovedFloorPlanAnalyzer()
    result = analyzer.analyze_floor_plan("path/to/floor_plan.jpg", "oslo")
    print(json.dumps(result, indent=2))
