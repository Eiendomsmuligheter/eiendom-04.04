import os
import json
import logging
from typing import Dict, List, Any, Optional
from .floor_plan_analyzer.floor_plan_analyzer_improved import ImprovedFloorPlanAnalyzer
from .CommuneConnect import CommuneConnect

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AnalysisIntegration:
    """
    Integration module that combines floor plan analysis with municipal regulations
    to provide comprehensive rental unit recommendations.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the analysis integration module.
        
        Args:
            config_path: Path to configuration file
        """
        self.config = self._load_config(config_path)
        self.floor_plan_analyzer = ImprovedFloorPlanAnalyzer(config_path)
        self.commune_connect = CommuneConnect(config_path)
        
        logger.info("Analysis Integration module initialized")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """
        Load configuration from file or use defaults.
        
        Args:
            config_path: Path to configuration file
            
        Returns:
            Configuration dictionary
        """
        default_config = {
            'output_dir': '/tmp/analysis_output',
            'max_budget': 500000,  # Default max budget in NOK
            'min_roi': 5.0,  # Minimum ROI percentage
            'prioritize_cost': True  # Prioritize cost-effectiveness over size
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
    
    def analyze_property(self, floor_plan_path: str, municipality: str, 
                        property_data: Optional[Dict[str, Any]] = None,
                        budget: Optional[float] = None) -> Dict[str, Any]:
        """
        Analyze a property for rental unit potential.
        
        Args:
            floor_plan_path: Path to floor plan image
            municipality: Municipality name
            property_data: Additional property data
            budget: Maximum budget for renovations
            
        Returns:
            Comprehensive analysis results
        """
        try:
            # Set budget
            if budget is None:
                budget = self.config['max_budget']
            
            # Get municipal requirements
            municipal_requirements = self.commune_connect.get_rental_unit_requirements(municipality)
            
            # Analyze floor plan
            floor_plan_analysis = self.floor_plan_analyzer.analyze_floor_plan(
                floor_plan_path, municipality)
            
            if 'error' in floor_plan_analysis:
                return {'error': floor_plan_analysis['error']}
            
            # Filter proposals by budget
            affordable_proposals = [
                p for p in floor_plan_analysis['rental_proposals']
                if sum(mod['estimated_cost'] for mod in p['modifications']) <= budget
            ]
            
            if not affordable_proposals:
                return {
                    'error': 'No affordable rental unit proposals found within budget',
                    'budget': budget,
                    'min_cost': min(
                        sum(mod['estimated_cost'] for mod in p['modifications'])
                        for p in floor_plan_analysis['rental_proposals']
                    ) if floor_plan_analysis['rental_proposals'] else None
                }
            
            # Filter proposals by ROI
            viable_proposals = [
                p for p in affordable_proposals
                if (p['estimated_rental_income'] * 12) / 
                   sum(mod['estimated_cost'] for mod in p['modifications']) * 100 >= self.config['min_roi']
            ]
            
            if not viable_proposals:
                return {
                    'error': 'No viable rental unit proposals found with acceptable ROI',
                    'min_roi': self.config['min_roi'],
                    'max_roi': max(
                        (p['estimated_rental_income'] * 12) / 
                        sum(mod['estimated_cost'] for mod in p['modifications']) * 100
                        for p in affordable_proposals
                    ) if affordable_proposals else None
                }
            
            # Sort proposals by cost-effectiveness or size
            if self.config['prioritize_cost']:
                # Sort by ROI (descending)
                viable_proposals.sort(
                    key=lambda p: (p['estimated_rental_income'] * 12) / 
                                 sum(mod['estimated_cost'] for mod in p['modifications']),
                    reverse=True
                )
            else:
                # Sort by area (descending)
                viable_proposals.sort(key=lambda p: p['area'], reverse=True)
            
            # Get best proposal
            best_proposal = viable_proposals[0]
            
            # Check compliance with municipal requirements
            compliance = self._check_compliance(best_proposal, municipal_requirements)
            
            # Generate renovation plan
            renovation_plan = self._generate_renovation_plan(best_proposal, municipality)
            
            # Calculate financial metrics
            financial_metrics = self._calculate_financial_metrics(best_proposal, municipality)
            
            # Prepare result
            result = {
                'property_analysis': {
                    'municipality': municipality,
                    'total_area': floor_plan_analysis['original_analysis']['dimensions']['total_area'],
                    'original_rooms': len(floor_plan_analysis['original_analysis']['rooms'])
                },
                'rental_unit': {
                    'area': best_proposal['area'],
                    'rooms': best_proposal['rooms'],
                    'room_types': best_proposal['room_types'],
                    'estimated_rental_income': best_proposal['estimated_rental_income']
                },
                'renovation': {
                    'total_cost': sum(mod['estimated_cost'] for mod in best_proposal['modifications']),
                    'modifications': best_proposal['modifications'],
                    'plan': renovation_plan
                },
                'financial': financial_metrics,
                'compliance': compliance,
                'alternative_proposals': [
                    {
                        'area': p['area'],
                        'rooms': p['rooms'],
                        'estimated_rental_income': p['estimated_rental_income'],
                        'total_cost': sum(mod['estimated_cost'] for mod in p['modifications']),
                        'roi': (p['estimated_rental_income'] * 12) / 
                              sum(mod['estimated_cost'] for mod in p['modifications']) * 100
                    }
                    for p in viable_proposals[1:3]  # Include up to 2 alternatives
                ]
            }
            
            # Save result if output directory is specified
            output_dir = self.config.get('output_dir')
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
                output_path = os.path.join(output_dir, f"analysis_{os.path.basename(floor_plan_path)}.json")
                with open(output_path, 'w') as f:
                    json.dump(result, f, indent=2)
                logger.info(f"Analysis result saved to {output_path}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error in property analysis: {e}")
            return {'error': f'Analysis failed: {str(e)}'}
    
    def _check_compliance(self, proposal: Dict[str, Any], 
                         municipal_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check if a proposal complies with municipal requirements.
        
        Args:
            proposal: Rental unit proposal
            municipal_requirements: Municipal requirements
            
        Returns:
            Compliance check results
        """
        # Initialize results
        results = {
            'compliant': True,
            'requirements_met': [],
            'requirements_pending': []
        }
        
        # Check minimum area
        if proposal['area'] >= municipal_requirements.get('min_area', 25):
            results['requirements_met'].append({
                'id': 'min_area',
                'name': 'Minimum area',
                'requirement': f"{municipal_requirements.get('min_area', 25)} m²",
                'actual': f"{proposal['area']:.1f} m²"
            })
        else:
            results['compliant'] = False
            results['requirements_pending'].append({
                'id': 'min_area',
                'name': 'Minimum area',
                'requirement': f"{municipal_requirements.get('min_area', 25)} m²",
                'actual': f"{proposal['area']:.1f} m²"
            })
        
        # Check separate entrance
        if municipal_requirements.get('separate_entrance', True):
            if any(mod['type'] == 'add_exterior_door' for mod in proposal['modifications']):
                results['requirements_pending'].append({
                    'id': 'separate_entrance',
                    'name': 'Separate entrance',
                    'requirement': 'Required',
                    'actual': 'Will be added'
                })
            else:
                results['requirements_met'].append({
                    'id': 'separate_entrance',
                    'name': 'Separate entrance',
                    'requirement': 'Required',
                    'actual': 'Already present'
                })
        
        # Check bathroom
        if municipal_requirements.get('bathroom_required', True):
            if any(mod['type'] == 'add_bathroom' for mod in proposal['modifications']):
                results['requirements_pending'].append({
                    'id': 'bathroom',
                    'name': 'Bathroom',
                    'requirement': 'Required',
                    'actual': 'Will be added'
                })
            else:
                results['requirements_met'].append({
                    'id': 'bathroom',
                    'name': 'Bathroom',
                    'requirement': 'Required',
                    'actual': 'Already present'
                })
        
        # Check kitchen
        if municipal_requirements.get('kitchen_required', True):
            if any(mod['type'] == 'add_kitchen' for mod in proposal['modifications']):
                results['requirements_pending'].append({
                    'id': 'kitchen',
                    'name': 'Kitchen',
                    'requirement': 'Required',
                    'actual': 'Will be added'
                })
            else:
                results['requirements_met'].append({
                    'id': 'kitchen',
                    'name': 'Kitchen',
                    'requirement': 'Required',
                    'actual': 'Already present'
                })
        
        # Check sound insulation
        if municipal_requirements.get('sound_insulation', True):
            results['requirements_pending'].append({
                'id': 'sound_insulation',
                'name': 'Sound insulation',
                'requirement': 'Required',
                'actual': 'Will be implemented'
            })
        
        # Check fire safety
        if municipal_requirements.get('fire_safety', []):
            results['requirements_pending'].append({
                'id': 'fire_safety',
                'name': 'Fire safety',
                'requirement': 'Required',
                'actual': 'Will be implemented'
            })
        
        # Check ventilation
        if municipal_requirements.get('ventilation', True):
            results['requirements_pending'].append({
                'id': 'ventilation',
                'name': 'Ventilation',
                'requirement': 'Required',
                'actual': 'Will be implemented'
            })
        
        # Add summary
        results['summary'] = {
            'total_requirements': len(results['requirements_met']) + len(results['requirements_pending']),
            'met': len(results['requirements_met']),
            'pending': len(results['requirements_pending'])
        }
        
        return results
    
    def _generate_renovation_plan(self, proposal: Dict[str, Any], 
                                 municipality: str) -> Dict[str, Any]:
        """
        Generate a renovation plan for a rental unit proposal.
        
        Args:
            proposal: Rental unit proposal
            municipality: Municipality name
            
        Returns:
            Renovation plan
        """
        # Get documentation requirements
        documentation_requirements = self.commune_connect.get_documentation_requirements(municipality)
        
        # Group modifications by type
        grouped_modifications = {}
        for mod in proposal['modifications']:
            mod_type = mod['type']
            if mod_type not in grouped_modifications:
                grouped_modifications[mod_type] = []
            grouped_modifications[mod_type].append(mod)
        
        # Generate phases
        phases = [
            {
                'name': 'Planning and permits',
                'description': 'Prepare documentation and apply for permits',
                'duration': '4-6 weeks',
                'tasks': [
                    {
                        'name': 'Prepare floor plans',
                        'description': 'Create detailed floor plans showing the proposed changes',
                        'duration': '1-2 weeks'
                    },
                    {
                        'name': 'Prepare technical documentation',
                        'description': 'Create technical documentation for electrical, plumbing, and ventilation',
                        'duration': '1-2 weeks'
                    },
                    {
                        'name': 'Apply for permits',
                        'description': 'Submit application to the municipality',
                        'duration': '2-4 weeks'
                    }
                ],
                'documentation': documentation_requirements
            },
            {
                'name': 'Structural changes',
                'description': 'Make structural changes to the property',
                'duration': '2-4 weeks',
                'tasks': [
                    {
                        'name': 'Add dividing walls',
                        'description': grouped_modifications.get('add_walls', [{}])[0].get('description', ''),
                        'duration': '1-2 weeks'
                    }
                ] + ([
                    {
                        'name': 'Add exterior door',
                        'description': 'Install new exterior door for separate entrance',
                        'duration': '2-3 days'
                    }
                ] if 'add_exterior_door' in grouped_modifications else [])
            },
            {
                'name': 'Plumbing and electrical',
                'description': 'Install plumbing and electrical systems',
                'duration': '2-3 weeks',
                'tasks': [
                    {
                        'name': 'Electrical installations',
                        'description': grouped_modifications.get('electrical_work', [{}])[0].get('description', ''),
                        'duration': '1-2 weeks'
                    },
                    {
                        'name': 'Plumbing installations',
                        'description': grouped_modifications.get('plumbing_work', [{}])[0].get('description', ''),
                        'duration': '1-2 weeks'
                    }
                ]
            },
            {
                'name': 'Bathroom and kitchen',
                'description': 'Install bathroom and kitchen',
                'duration': '2-4 weeks',
                'tasks': []
            },
            {
                'name': 'Finishing',
                'description': 'Complete finishing work',
                'duration': '2-3 weeks',
                'tasks': [
                    {
                        'name': 'Flooring',
                        'description': grouped_modifications.get('flooring', [{}])[0].get('description', ''),
                        'duration': '3-5 days'
                    },
                    {
                        'name': 'Painting',
                        'description': grouped_modifications.get('painting', [{}])[0].get('description', ''),
                        'duration': '3-5 days'
                    },
                    {
                        'name': 'Interior doors',
                        'description': grouped_modifications.get('add_interior_doors', [{}])[0].get('description', ''),
                        'duration': '1-2 days'
                    }
                ]
            },
            {
                'name': 'Inspection and approval',
                'description': 'Final inspection and approval',
                'duration': '1-2 weeks',
                'tasks': [
                    {
                        'name': 'Self-inspection',
                        'description': 'Perform self-inspection of the completed work',
                        'duration': '1-2 days'
                    },
                    {
                        'name': 'Municipal inspection',
                        'description': 'Schedule and complete municipal inspection',
                        'duration': '1-2 weeks'
                    }
                ]
            }
        ]
        
        # Add bathroom tasks if needed
        if 'add_bathroom' in grouped_modifications:
            phases[3]['tasks'].append({
                'name': 'Install bathroom',
                'description': grouped_modifications['add_bathroom'][0]['description'],
                'duration': '1-2 weeks'
            })
        
        # Add kitchen tasks if needed
        if 'add_kitchen' in grouped_modifications:
            phases[3]['tasks'].append({
                'name': 'Install kitchen',
                'description': grouped_modifications['add_kitchen'][0]['description'],
                'duration': '1-2 weeks'
            })
        
        # Calculate total duration and cost
        min_duration = sum(int(phase['duration'].split('-')[0]) for phase in phases)
        max_duration = sum(int(phase['duration'].split('-')[1].split(' ')[0]) for phase in phases)
        total_cost = sum(mod['estimated_cost'] for mod in proposal['modifications'])
        
        return {
            'phases': phases,
            'total_duration': f"{min_duration}-{max_duration} weeks",
            'total_cost': total_cost,
            'recommended_contractors': [
                {
                    'type': 'General contractor',
                    'description': 'For overall project management and coordination'
                },
                {
                    'type': 'Electrician',
                    'description': 'For electrical installations'
                },
                {
                    'type': 'Plumber',
                    'description': 'For plumbing installations'
                }
            ]
        }
    
    def _calculate_financial_metrics(self, proposal: Dict[str, Any], 
                                    municipality: str) -> Dict[str, Any]:
        """
        Calculate financial metrics for a rental unit proposal.
        
        Args:
            proposal: Rental unit proposal
            municipality: Municipality name
            
        Returns:
            Financial metrics
        """
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
        
        # Estimate property value increase
        property_value_increase = total_cost * 0.7  # Assume 70% of renovation cost adds to property value
        
        # Estimate tax implications
        tax_deductible = total_cost * 0.2  # Assume 20% of cost is tax deductible in first year
        annual_tax_deduction = (total_cost - tax_deductible) * 0.04  # Assume 4% annual depreciation
        
        # Calculate cash flow
        monthly_expenses = {
            'maintenance': monthly_income * 0.1,  # 10% of rent for maintenance
            'insurance': 300,  # NOK per month
            'property_tax': 200,  # NOK per month
            'other': 200  # NOK per month
        }
        total_monthly_expenses = sum(monthly_expenses.values())
        monthly_cash_flow = monthly_income - total_monthly_expenses
        annual_cash_flow = monthly_cash_flow * 12
        
        return {
            'investment': {
                'total_cost': total_cost,
                'cost_per_sqm': total_cost / proposal['area']
            },
            'income': {
                'monthly': monthly_income,
                'annual': annual_income,
                'income_per_sqm': monthly_income / proposal['area']
            },
            'expenses': {
                'monthly': total_monthly_expenses,
                'annual': total_monthly_expenses * 12,
                'breakdown': monthly_expenses
            },
            'cash_flow': {
                'monthly': monthly_cash_flow,
                'annual': annual_cash_flow
            },
            'roi': {
                'percentage': roi_percentage,
                'payback_period': payback_period
            },
            'profit': {
                'five_year': five_year_profit,
                'ten_year': ten_year_profit
            },
            'property_value': {
                'estimated_increase': property_value_increase
            },
            'tax': {
                'first_year_deduction': tax_deductible,
                'annual_depreciation': annual_tax_deduction
            }
        }

# Example usage
if __name__ == "__main__":
    integration = AnalysisIntegration()
    result = integration.analyze_property("path/to/floor_plan.jpg", "oslo", budget=400000)
    print(json.dumps(result, indent=2))
