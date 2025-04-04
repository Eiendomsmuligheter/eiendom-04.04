"""
3D Modeling Service for Eiendomsmuligheter Platform.

This module provides comprehensive 3D modeling capabilities including:
- Terrain modeling based on height data
- Building modeling based on property data
- 3D visualization preparation
- Export to various 3D formats
- Integration with Kartverket APIs for terrain data
"""
import os
import logging
import json
import numpy as np
import math
from typing import Dict, List, Tuple, Optional, Any, Union
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import uuid
import trimesh
from scipy.spatial import Delaunay
from stl import mesh

# Import project modules
try:
    from services.kartverket_api import kartverket_api, KartverketAPIError
    from models.property import Property, Building, Coordinates
    # Import AI modules
    from ai_modules.AlterraML import AlterraML, PropertyData
except ImportError:
    # Fallback for direct imports
    from backend.services.kartverket_api import kartverket_api, KartverketAPIError
    from backend.models.property import Property, Building, Coordinates
    # Import AI modules
    try:
        from ai_modules.AlterraML import AlterraML, PropertyData
    except ImportError:
        logger.error("Could not import AlterraML, AI integration will be disabled")
        AlterraML = None
        PropertyData = None

# Set up logging
logger = logging.getLogger(__name__)

# Constants
DEFAULT_RESOLUTION = 10  # Points per meter
DEFAULT_TERRAIN_RADIUS = 100  # Meters around property center
DEFAULT_MODEL_DIR = "data/models"
DEFAULT_TEXTURE_DIR = "data/textures"
TERRAIN_HEIGHT_MULTIPLIER = 1.0  # For exaggerating terrain features

# Initialize AI engine
try:
    ai_engine = AlterraML() if AlterraML else None
except Exception as e:
    logger.error(f"Failed to initialize AI engine: {str(e)}")
    ai_engine = None

@dataclass
class ModelingOptions:
    """Options for 3D model generation"""
    resolution: float = DEFAULT_RESOLUTION  # Points per meter
    terrain_radius: float = DEFAULT_TERRAIN_RADIUS  # Meters
    include_buildings: bool = True
    include_terrain: bool = True
    texture_buildings: bool = True
    texture_terrain: bool = True
    terrain_height_multiplier: float = TERRAIN_HEIGHT_MULTIPLIER
    lod: int = 2  # Level of detail (1-5)
    format: str = "glb"  # Output format (glb, obj, stl)

class TerrainModel:
    """Class for generating 3D terrain models"""
    
    def __init__(self, 
                 center_lat: float, 
                 center_lon: float, 
                 radius: float = DEFAULT_TERRAIN_RADIUS,
                 resolution: float = DEFAULT_RESOLUTION):
        """
        Initialize terrain model.
        
        Args:
            center_lat: Latitude of center point
            center_lon: Longitude of center point
            radius: Radius in meters around center point
            resolution: Resolution in points per meter
        """
        self.center_lat = center_lat
        self.center_lon = center_lon
        self.radius = radius
        self.resolution = resolution
        self.height_data = None
        self.mesh = None
        
    def fetch_terrain_data(self) -> bool:
        """
        Fetch terrain height data from Kartverket.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Fetching terrain data for coordinates {self.center_lat}, {self.center_lon}")
            terrain_data = kartverket_api.get_terrain_model(
                latitude=self.center_lat,
                longitude=self.center_lon,
                radius=self.radius
            )
            
            # Check if we got valid data
            if not terrain_data or 'points' not in terrain_data or not terrain_data['points']:
                logger.error(f"No terrain data received for {self.center_lat}, {self.center_lon}")
                return False
            
            # Process terrain data points
            self.height_data = self._process_terrain_data(terrain_data)
            return True
            
        except KartverketAPIError as e:
            logger.error(f"Failed to fetch terrain data: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error processing terrain data: {str(e)}")
            return False
    
    def _process_terrain_data(self, terrain_data: Dict[str, Any]) -> np.ndarray:
        """
        Process raw terrain data into a regular grid.
        
        Args:
            terrain_data: Raw terrain data from Kartverket API
            
        Returns:
            NumPy array with height data on a regular grid
        """
        # Extract points from terrain data
        points = terrain_data.get('points', [])
        
        # Convert to UTM coordinates for regular grid
        utm_points = []
        heights = []
        
        for point in points:
            x = point.get('x', 0)  # UTM Easting
            y = point.get('y', 0)  # UTM Northing
            z = point.get('z', 0)  # Height
            utm_points.append((x, y))
            heights.append(z)
        
        # Create a regular grid
        if not utm_points:
            raise ValueError("No terrain points available")
            
        # Find bounds
        x_coords = [p[0] for p in utm_points]
        y_coords = [p[1] for p in utm_points]
        min_x, max_x = min(x_coords), max(x_coords)
        min_y, max_y = min(y_coords), max(y_coords)
        
        # Create a regular grid
        grid_size = int(self.radius * 2 * self.resolution)
        x_grid = np.linspace(min_x, max_x, grid_size)
        y_grid = np.linspace(min_y, max_y, grid_size)
        
        # Interpolate heights on the regular grid
        from scipy.interpolate import griddata
        grid_x, grid_y = np.meshgrid(x_grid, y_grid)
        grid_z = griddata(utm_points, heights, (grid_x, grid_y), method='cubic', fill_value=0)
        
        return grid_z
    
    def generate_mesh(self, height_multiplier: float = TERRAIN_HEIGHT_MULTIPLIER) -> bool:
        """
        Generate a 3D mesh from height data.
        
        Args:
            height_multiplier: Multiplier for height values
            
        Returns:
            True if successful, False otherwise
        """
        if self.height_data is None:
            logger.error("No height data available for mesh generation")
            return False
        
        try:
            # Create vertices
            grid_size = self.height_data.shape[0]
            vertices = []
            
            # Scale to make it visually appealing
            scale_factor = self.radius * 2 / grid_size
            
            for i in range(grid_size):
                for j in range(grid_size):
                    # Convert grid coordinates to world coordinates
                    x = j * scale_factor - self.radius
                    y = i * scale_factor - self.radius
                    z = self.height_data[i, j] * height_multiplier
                    vertices.append([x, y, z])
            
            vertices = np.array(vertices)
            
            # Create triangular faces (two triangles per grid cell)
            faces = []
            for i in range(grid_size - 1):
                for j in range(grid_size - 1):
                    # Calculate vertex indices
                    idx00 = i * grid_size + j
                    idx01 = i * grid_size + (j + 1)
                    idx10 = (i + 1) * grid_size + j
                    idx11 = (i + 1) * grid_size + (j + 1)
                    
                    # Add two triangles to form a quad
                    faces.append([idx00, idx10, idx11])
                    faces.append([idx00, idx11, idx01])
            
            faces = np.array(faces)
            
            # Create mesh
            self.mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
            return True
            
        except Exception as e:
            logger.error(f"Error generating terrain mesh: {str(e)}")
            return False
    
    def export_model(self, output_path: str, file_format: str = "glb") -> str:
        """
        Export the terrain model to a file.
        
        Args:
            output_path: Directory to save the model
            file_format: Output format (glb, obj, stl)
            
        Returns:
            Path to the exported file
        """
        if self.mesh is None:
            logger.error("No mesh available for export")
            return ""
        
        try:
            # Create output directory if it doesn't exist
            os.makedirs(output_path, exist_ok=True)
            
            # Generate unique filename
            filename = f"terrain_{uuid.uuid4().hex[:8]}.{file_format}"
            filepath = os.path.join(output_path, filename)
            
            # Export based on format
            if file_format == "glb":
                self.mesh.export(filepath, file_type="glb")
            elif file_format == "obj":
                self.mesh.export(filepath, file_type="obj")
            elif file_format == "stl":
                self.mesh.export(filepath, file_type="stl")
            else:
                logger.error(f"Unsupported file format: {file_format}")
                return ""
            
            logger.info(f"Terrain model exported to {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Error exporting terrain model: {str(e)}")
            return ""


class BuildingModel:
    """Class for generating 3D building models"""
    
    def __init__(self, building: Building, base_height: float = 0.0):
        """
        Initialize building model.
        
        Args:
            building: Building data
            base_height: Base height in meters (ground level)
        """
        self.building = building
        self.base_height = base_height
        self.mesh = None
    
    def generate_mesh(self) -> bool:
        """
        Generate a 3D mesh for the building.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Basic building properties
            building_type = self.building.building_type
            floors = self.building.number_of_floors or 2  # Default to 2 if not specified
            
            # Calculate dimensions based on gross area
            if self.building.gross_area:
                # Approximate dimensions from area
                area = self.building.gross_area
                width = math.sqrt(area / floors)  # Simplified as square footprint
                length = width
            else:
                # Default dimensions
                width = 10.0
                length = 8.0
            
            # Calculate height
            floor_height = 3.0  # Average floor height in meters
            height = floors * floor_height
            
            # Create building mesh based on type
            if building_type in ["enebolig", "tomannsbolig", "rekkehus", "hytte"]:
                self.mesh = self._create_house_mesh(width, length, height)
            elif building_type == "leilighetsbygg":
                self.mesh = self._create_apartment_building_mesh(width, length, height)
            elif building_type in ["næringsbygg", "industribygg", "offentlig_bygg"]:
                self.mesh = self._create_commercial_building_mesh(width, length, height)
            else:
                # Generic building
                self.mesh = self._create_generic_building_mesh(width, length, height)
            
            return True
            
        except Exception as e:
            logger.error(f"Error generating building mesh: {str(e)}")
            return False
    
    def _create_house_mesh(self, width: float, length: float, height: float) -> trimesh.Trimesh:
        """
        Create a mesh for a house with a pitched roof.
        
        Args:
            width: Building width in meters
            length: Building length in meters
            height: Building height in meters
            
        Returns:
            Trimesh object
        """
        # Create base box
        base_height = height * 0.7  # Roof starts at 70% of total height
        box = trimesh.creation.box(extents=[width, length, base_height])
        
        # Create roof
        roof_height = height - base_height
        roof_vertices = np.array([
            [width/2, length/2, base_height],      # Top center
            [-width/2, -length/2, base_height],    # Back left
            [width/2, -length/2, base_height],     # Back right
            [-width/2, length/2, base_height],     # Front left
            [width/2, length/2, base_height],      # Front right
            [0, 0, height]                         # Peak
        ])
        
        roof_faces = np.array([
            [0, 1, 2],  # Back face
            [0, 3, 1],  # Left face
            [0, 2, 4],  # Right face
            [0, 4, 3],  # Front face
            [5, 2, 1],  # Back slope
            [5, 1, 3],  # Left slope
            [5, 4, 2],  # Right slope
            [5, 3, 4]   # Front slope
        ])
        
        roof = trimesh.Trimesh(vertices=roof_vertices, faces=roof_faces)
        
        # Combine base and roof
        house = trimesh.util.concatenate([box, roof])
        
        # Move so the bottom is at y=0
        translation = [0, 0, self.base_height + base_height / 2]
        house.apply_translation(translation)
        
        return house
    
    def _create_apartment_building_mesh(self, width: float, length: float, height: float) -> trimesh.Trimesh:
        """
        Create a mesh for an apartment building.
        
        Args:
            width: Building width in meters
            length: Building length in meters
            height: Building height in meters
            
        Returns:
            Trimesh object
        """
        # Apartment buildings are typically taller with flat roofs
        # Scale up dimensions for apartment buildings
        width *= 1.5
        length *= 1.5
        
        # Create building box
        building = trimesh.creation.box(extents=[width, length, height])
        
        # Move so the bottom is at base_height
        translation = [0, 0, self.base_height + height / 2]
        building.apply_translation(translation)
        
        # Add window pattern
        # This is simplified - in a real implementation, we would create 
        # actual geometry or use textures for windows
        
        return building
    
    def _create_commercial_building_mesh(self, width: float, length: float, height: float) -> trimesh.Trimesh:
        """
        Create a mesh for a commercial or industrial building.
        
        Args:
            width: Building width in meters
            length: Building length in meters
            height: Building height in meters
            
        Returns:
            Trimesh object
        """
        # Commercial buildings are typically wider
        width *= 2
        length *= 2
        
        # Create building box
        building = trimesh.creation.box(extents=[width, length, height])
        
        # Move so the bottom is at base_height
        translation = [0, 0, self.base_height + height / 2]
        building.apply_translation(translation)
        
        return building
    
    def _create_generic_building_mesh(self, width: float, length: float, height: float) -> trimesh.Trimesh:
        """
        Create a mesh for a generic building.
        
        Args:
            width: Building width in meters
            length: Building length in meters
            height: Building height in meters
            
        Returns:
            Trimesh object
        """
        # Create simple box
        building = trimesh.creation.box(extents=[width, length, height])
        
        # Move so the bottom is at base_height
        translation = [0, 0, self.base_height + height / 2]
        building.apply_translation(translation)
        
        return building
    
    def export_model(self, output_path: str, file_format: str = "glb") -> str:
        """
        Export the building model to a file.
        
        Args:
            output_path: Directory to save the model
            file_format: Output format (glb, obj, stl)
            
        Returns:
            Path to the exported file
        """
        if self.mesh is None:
            logger.error("No mesh available for export")
            return ""
        
        try:
            # Create output directory if it doesn't exist
            os.makedirs(output_path, exist_ok=True)
            
            # Generate unique filename
            building_id = self.building.id
            filename = f"building_{building_id}.{file_format}"
            filepath = os.path.join(output_path, filename)
            
            # Export based on format
            if file_format == "glb":
                self.mesh.export(filepath, file_type="glb")
            elif file_format == "obj":
                self.mesh.export(filepath, file_type="obj")
            elif file_format == "stl":
                self.mesh.export(filepath, file_type="stl")
            else:
                logger.error(f"Unsupported file format: {file_format}")
                return ""
            
            logger.info(f"Building model exported to {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Error exporting building model: {str(e)}")
            return ""


class PropertyModel:
    """Class for generating a complete 3D model of a property including terrain and buildings"""
    
    def __init__(self, property_data: Property, options: ModelingOptions = None):
        """
        Initialize property model.
        
        Args:
            property_data: Property data
            options: Modeling options
        """
        self.property = property_data
        self.options = options or ModelingOptions()
        self.terrain_model = None
        self.building_models = []
        self.combined_mesh = None
        self.model_id = f"property_model_{uuid.uuid4().hex[:8]}"
    
    def generate_model(self) -> bool:
        """
        Generate a complete 3D model of the property.
        
        Returns:
            True if successful, False otherwise
        """
        success = True
        
        # Generate terrain model if requested
        if self.options.include_terrain:
            success = success and self._generate_terrain()
        
        # Generate building models if requested
        if self.options.include_buildings:
            success = success and self._generate_buildings()
        
        # Combine terrain and buildings
        if success:
            success = success and self._combine_models()
        
        return success
    
    def _generate_terrain(self) -> bool:
        """
        Generate terrain model for the property.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get property coordinates
            coords = self.property.coordinates
            
            # Initialize terrain model
            self.terrain_model = TerrainModel(
                center_lat=coords.latitude,
                center_lon=coords.longitude,
                radius=self.options.terrain_radius,
                resolution=self.options.resolution
            )
            
            # Fetch terrain data
            if not self.terrain_model.fetch_terrain_data():
                logger.error("Failed to fetch terrain data")
                return False
            
            # Generate terrain mesh
            if not self.terrain_model.generate_mesh(height_multiplier=self.options.terrain_height_multiplier):
                logger.error("Failed to generate terrain mesh")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error generating terrain for property: {str(e)}")
            return False
    
    def _generate_buildings(self) -> bool:
        """
        Generate building models for the property.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Reset building models
            self.building_models = []
            
            # Get buildings data
            buildings = self.property.buildings
            
            # Skip if no buildings
            if not buildings:
                logger.info("No buildings found for property")
                return True
            
            # Get terrain heights at building locations or use default
            base_heights = {}
            if self.terrain_model and self.terrain_model.mesh:
                # In a real implementation, we would sample the terrain height
                # at each building's location. For simplicity, we use a single height.
                base_height = 0.0  # Default
            else:
                base_height = 0.0
            
            # Create building models
            for building in buildings:
                building_model = BuildingModel(building, base_height=base_height)
                if building_model.generate_mesh():
                    self.building_models.append(building_model)
                else:
                    logger.warning(f"Failed to generate mesh for building {building.id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error generating buildings for property: {str(e)}")
            return False
    
    def _combine_models(self) -> bool:
        """
        Combine terrain and building models into a single mesh.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            meshes = []
            
            # Add terrain mesh
            if self.terrain_model and self.terrain_model.mesh:
                meshes.append(self.terrain_model.mesh)
            
            # Add building meshes
            for building_model in self.building_models:
                if building_model.mesh:
                    meshes.append(building_model.mesh)
            
            # Skip if no meshes
            if not meshes:
                logger.error("No meshes available to combine")
                return False
            
            # Combine meshes
            self.combined_mesh = trimesh.util.concatenate(meshes)
            return True
            
        except Exception as e:
            logger.error(f"Error combining models: {str(e)}")
            return False
    
    def export_model(self, output_dir: str = DEFAULT_MODEL_DIR) -> Dict[str, Any]:
        """
        Export the property model and return metadata.
        
        Args:
            output_dir: Directory to save the model
            
        Returns:
            Dictionary with model metadata
        """
        result = {
            "model_id": self.model_id,
            "property_id": self.property.property_id,
            "created_at": datetime.now().isoformat(),
            "files": []
        }
        
        try:
            # Create model directory
            model_dir = os.path.join(output_dir, self.model_id)
            os.makedirs(model_dir, exist_ok=True)
            
            # Export combined model
            if self.combined_mesh:
                combined_path = os.path.join(model_dir, f"combined.{self.options.format}")
                self.combined_mesh.export(combined_path, file_type=self.options.format)
                result["files"].append({
                    "type": "combined",
                    "format": self.options.format,
                    "path": combined_path
                })
            
            # Export terrain model
            if self.terrain_model and self.terrain_model.mesh:
                terrain_path = self.terrain_model.export_model(model_dir, self.options.format)
                if terrain_path:
                    result["files"].append({
                        "type": "terrain",
                        "format": self.options.format,
                        "path": terrain_path
                    })
            
            # Export building models
            for i, building_model in enumerate(self.building_models):
                if building_model.mesh:
                    building_path = building_model.export_model(model_dir, self.options.format)
                    if building_path:
                        result["files"].append({
                            "type": "building",
                            "building_id": building_model.building.id,
                            "format": self.options.format,
                            "path": building_path
                        })
            
            # Save metadata
            metadata_path = os.path.join(model_dir, "metadata.json")
            with open(metadata_path, 'w') as f:
                json.dump(result, f, indent=2)
            
            return result
            
        except Exception as e:
            logger.error(f"Error exporting property model: {str(e)}")
            return {
                "model_id": self.model_id,
                "property_id": self.property.property_id,
                "error": str(e),
                "files": []
            }


def generate_property_model(property_data: Property, options: Optional[ModelingOptions] = None) -> Dict[str, Any]:
    """
    Generate a 3D model for a property.
    
    Args:
        property_data: Property data
        options: Modeling options
        
    Returns:
        Dictionary with model metadata
    """
    options = options or ModelingOptions()
    property_model = PropertyModel(property_data, options)
    
    if property_model.generate_model():
        return property_model.export_model()
    else:
        return {
            "model_id": property_model.model_id,
            "property_id": property_data.property_id,
            "error": "Failed to generate property model",
            "files": []
        }
    
def get_model_viewer_html(model_metadata: Dict[str, Any]) -> str:
    """
    Generate HTML for viewing a 3D model.
    
    Args:
        model_metadata: Model metadata from generate_property_model
        
    Returns:
        HTML string for viewing the model
    """
    # Find the combined model file
    model_file = None
    for file_info in model_metadata.get("files", []):
        if file_info.get("type") == "combined":
            model_file = file_info.get("path")
            break
    
    if not model_file:
        return f"<p>No model file available for property {model_metadata.get('property_id')}</p>"
    
    # Convert to web path
    web_path = f"/static/models/{model_metadata['model_id']}/combined.{model_file.split('.')[-1]}"
    
    # Generate HTML using model-viewer web component
    html = f"""
    <!DOCTYPE html>
    <html lang="no">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>3D-modell for eiendom {model_metadata.get('property_id')}</title>
        <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
        <style>
            body, html {{
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }}
            model-viewer {{
                width: 100%;
                height: 100%;
                background-color: #f5f5f5;
            }}
        </style>
    </head>
    <body>
        <model-viewer 
            src="{web_path}" 
            alt="3D-modell av eiendom {model_metadata.get('property_id')}"
            shadow-intensity="1" 
            camera-controls 
            auto-rotate 
            ar 
            ar-modes="webxr scene-viewer"
            environment-image="neutral">
        </model-viewer>
    </body>
    </html>
    """
    
    return html 

async def generate_model_with_ai_analysis(property_id: str, property_data: Dict, options: ModelingOptions = None) -> Dict:
    """
    Generate a 3D model with AI-enhanced analysis.
    
    This function integrates the AI analysis results with the 3D modeling process
    to create an optimized model that highlights development potential.
    
    Args:
        property_id: The ID of the property
        property_data: Property data dictionary
        options: Modeling options
        
    Returns:
        Dictionary with model metadata and paths
    """
    logger.info(f"Generating AI-enhanced 3D model for property {property_id}")
    
    if not ai_engine:
        logger.warning("AI engine not available, falling back to standard modeling")
        return await generate_model(property_id, property_data, options)
    
    try:
        # Convert property data to PropertyData object for AI analysis
        ai_property_data = PropertyData(**property_data)
        
        # Perform AI analysis
        logger.info("Running AI analysis for property optimization")
        analysis_results = await ai_engine.analyze_property(ai_property_data)
        
        # Extract optimization suggestions from AI analysis
        optimization = analysis_results.development_potential
        
        # Create base model
        model_metadata = await generate_model(property_id, property_data, options)
        
        # Enhance model with AI suggestions
        if optimization and "suggested_buildings" in optimization:
            logger.info("Adding AI-suggested buildings to model")
            model_id = model_metadata.get("model_id")
            model_dir = os.path.join(DEFAULT_MODEL_DIR, model_id)
            
            # Load existing model
            existing_model = trimesh.load(os.path.join(model_dir, "combined.glb"))
            
            # Add suggested buildings from AI analysis
            for building in optimization["suggested_buildings"]:
                # Create building mesh based on AI suggestions
                building_mesh = _create_building_mesh(
                    position=(building.get("x", 0), building.get("y", 0)),
                    dimensions=(building.get("width", 10), building.get("length", 10), building.get("height", 8)),
                    rotation=building.get("rotation", 0)
                )
                
                # Add to existing model with a different color to highlight it
                building_mesh.visual.face_colors = [200, 100, 100, 150]  # Reddish transparent
                existing_model = trimesh.util.concatenate([existing_model, building_mesh])
            
            # Save enhanced model
            enhanced_path = os.path.join(model_dir, "ai_enhanced.glb")
            existing_model.export(enhanced_path)
            
            # Update metadata
            model_metadata["files"].append({
                "type": "ai_enhanced",
                "format": "glb",
                "path": enhanced_path
            })
            model_metadata["ai_enhanced"] = True
            model_metadata["ai_analysis_summary"] = {
                "development_potential": optimization.get("summary", ""),
                "suggested_buildings_count": len(optimization.get("suggested_buildings", [])),
                "estimated_value_increase": optimization.get("estimated_value_increase", 0)
            }
            
            # Save updated metadata
            with open(os.path.join(model_dir, "metadata.json"), "w") as f:
                json.dump(model_metadata, f, indent=2)
        
        return model_metadata
    
    except Exception as e:
        logger.error(f"Error in AI-enhanced modeling: {str(e)}")
        # Fallback to standard modeling
        return await generate_model(property_id, property_data, options)

def _create_building_mesh(position: Tuple[float, float], dimensions: Tuple[float, float, float], rotation: float = 0) -> trimesh.Trimesh:
    """
    Create a building mesh for AI-suggested buildings.
    
    Args:
        position: (x, y) position
        dimensions: (width, length, height)
        rotation: Rotation in degrees
        
    Returns:
        Trimesh object representing the building
    """
    width, length, height = dimensions
    x, y = position
    
    # Create a box
    building = trimesh.creation.box(dimensions=(width, length, height))
    
    # Apply rotation
    rotation_matrix = trimesh.transformations.rotation_matrix(
        angle=math.radians(rotation),
        direction=[0, 0, 1],
        point=[0, 0, 0]
    )
    building.apply_transform(rotation_matrix)
    
    # Apply translation
    translation_matrix = trimesh.transformations.translation_matrix([x, y, height/2])
    building.apply_transform(translation_matrix)
    
    return building 