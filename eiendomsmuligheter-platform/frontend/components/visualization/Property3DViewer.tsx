import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Button, Stack } from '@mui/material';
import { OmniverseClient, OmniverseViewer } from '../../services/omniverseService';
import { Property, BuildingModelData, BuildingFloor, BuildingWall, BuildingOpening, BuildingFeature } from '../../types/property';
import styles from '../../styles/Property3DViewer.module.css';

interface Property3DViewerProps {
  property: Property;
  className?: string;
}

/**
 * Generator-klasse for å lage 3D-modeller av eiendommer
 */
class BuildingModelGenerator {
  private model: BuildingModelData;
  
  constructor() {
    this.model = {
      id: '',
      propertyId: '',
      version: '1.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      floors: []
    };
  }
  
  async generateModelFromData(property: Property): Promise<BuildingModelData> {
    this.model.propertyId = property.id;
    this.model.id = `model_${property.id}_${Date.now()}`;
    
    const floors = this.generateFloors(property);
    this.model.floors = floors;
    
    const walls = this.generateWalls(floors);
    floors.forEach((floor, index) => {
      this.model.floors[index].walls = walls.filter(w => w.properties?.floorId === floor.id);
    });
    
    const openings = this.generateOpenings(walls);
    walls.forEach((wall, index) => {
      if (walls[index].openings) {
        walls[index].openings = openings.filter(o => o.wallId === wall.id);
      }
    });
    
    const features = this.generateFeatures(property);
    floors.forEach((floor, index) => {
      this.model.floors[index].features = features.filter(f => f.properties?.floorId === floor.id);
    });
    
    return this.model;
  }
  
  generateFloors(property: Property): BuildingFloor[] {
    const floorCount = property.numberOfFloors || 1;
    const floors: BuildingFloor[] = [];
    
    for (let i = 0; i < floorCount; i++) {
      const floorHeight = 2.7; // Standard høyde i meter
      
      floors.push({
        id: `floor_${i}`,
        level: i,
        height: floorHeight,
        area: property.dimensions.area / floorCount,
        elevation: i * floorHeight,
        walls: [],
        features: [],
        properties: {
          name: i === 0 ? 'Grunnflate' : `Etasje ${i}`
        }
      });
    }
    
    return floors;
  }
  
  generateWalls(floors: BuildingFloor[]): BuildingWall[] {
    const walls: BuildingWall[] = [];
    
    floors.forEach(floor => {
      // Forenklet modell: Vi lager bare en boks
      const floorWidth = Math.sqrt(floor.area);
      const floorDepth = floorWidth;
      
      // Front wall
      walls.push({
        id: `wall_${floor.id}_front`,
        type: 'exterior',
        start: { x: 0, y: 0 },
        end: { x: floorWidth, y: 0 },
        height: floor.height,
        thickness: 0.25,
        properties: {
          floorId: floor.id,
          orientation: 'front'
        }
      });
      
      // Back wall
      walls.push({
        id: `wall_${floor.id}_back`,
        type: 'exterior',
        start: { x: 0, y: floorDepth },
        end: { x: floorWidth, y: floorDepth },
        height: floor.height,
        thickness: 0.25,
        properties: {
          floorId: floor.id,
          orientation: 'back'
        }
      });
      
      // Left wall
      walls.push({
        id: `wall_${floor.id}_left`,
        type: 'exterior',
        start: { x: 0, y: 0 },
        end: { x: 0, y: floorDepth },
        height: floor.height,
        thickness: 0.25,
        properties: {
          floorId: floor.id,
          orientation: 'left'
        }
      });
      
      // Right wall
      walls.push({
        id: `wall_${floor.id}_right`,
        type: 'exterior',
        start: { x: floorWidth, y: 0 },
        end: { x: floorWidth, y: floorDepth },
        height: floor.height,
        thickness: 0.25,
        properties: {
          floorId: floor.id,
          orientation: 'right'
        }
      });
    });
    
    return walls;
  }
  
  generateOpenings(walls: BuildingWall[]): BuildingOpening[] {
    const openings: BuildingOpening[] = [];
    
    walls.forEach(wall => {
      // Legg til en dør på frontveggen i første etasje
      if (wall.properties?.orientation === 'front' && wall.properties?.floorId === 'floor_0') {
        const wallLength = Math.sqrt(
          Math.pow(wall.end.x - wall.start.x, 2) + 
          Math.pow(wall.end.y - wall.start.y, 2)
        );
        
        openings.push({
          id: `door_main`,
          type: 'door',
          width: 1.0,
          height: 2.1,
          position: {
            x: wallLength / 2,
            y: 0,
            z: 0
          },
          wallId: wall.id
        });
      }
      
      // Legg til vinduer på alle yttervegger
      if (wall.type === 'exterior') {
        const wallLength = Math.sqrt(
          Math.pow(wall.end.x - wall.start.x, 2) + 
          Math.pow(wall.end.y - wall.start.y, 2)
        );
        
        // Legg til vinduer med jevne mellomrom
        const windowCount = Math.floor(wallLength / 2);
        const spacing = wallLength / (windowCount + 1);
        
        for (let i = 0; i < windowCount; i++) {
          openings.push({
            id: `window_${wall.id}_${i}`,
            type: 'window',
            width: 1.2,
            height: 1.4,
            position: {
              x: spacing * (i + 1),
              y: 0,
              z: wall.height / 2
            },
            wallId: wall.id
          });
        }
      }
    });
    
    return openings;
  }
  
  generateFeatures(property: Property): BuildingFeature[] {
    const features: BuildingFeature[] = [];
    
    if (property.features?.includes('swimming_pool')) {
      features.push({
        id: 'feature_swimming_pool',
        type: 'swimming_pool',
        name: 'Svømmebasseng',
        location: { x: 10, y: 10, z: 0 },
        dimensions: { width: 5, height: 2 },
        properties: {
          floorId: 'floor_0',
          material: 'tile'
        }
      });
    }
    
    if (property.features?.includes('garage')) {
      features.push({
        id: 'feature_garage',
        type: 'garage',
        name: 'Garasje',
        location: { x: -5, y: 0, z: 0 },
        dimensions: { width: 6, height: 2.5, depth: 6 },
        properties: {
          floorId: 'floor_0',
          capacity: 2
        }
      });
    }
    
    return features;
  }
  
  async exportToGLTF(modelData: BuildingModelData): Promise<Blob> {
    // Simuler eksport til GLTF, i en ekte implementering ville vi brukt Three.js eller en annen 3D-bibliotek
    return new Blob([JSON.stringify(modelData)], { type: 'model/gltf+json' });
  }
  
  exportToJSON(modelData: BuildingModelData): string {
    return JSON.stringify(modelData, null, 2);
  }
}

const Property3DViewer: React.FC<Property3DViewerProps> = ({
  property,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<OmniverseViewer | null>(null);
  const [modelData, setModelData] = useState<BuildingModelData | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  
  // Initialiser OmniverseClient
  useEffect(() => {
    const initViewer = async () => {
      if (!containerRef.current) return;
      
      try {
        setLoading(true);
        
        // Hent modell-URL fra backend
        const modelResponse = await fetch(`/api/properties/${property.id}/models`);
        if (!modelResponse.ok) {
          throw new Error('Kunne ikke hente modelldata');
        }
        
        const models = await modelResponse.json();
        if (models && models.length > 0) {
          setModelUrl(`/models/properties/${property.id}.json`);
        } else {
          // Generer modell lokalt hvis ingen modell finnes
          const generator = new BuildingModelGenerator();
          const generatedModel = await generator.generateModelFromData(property);
          setModelData(generatedModel);
        }
        
        // Opprett Omniverse-klient og viewer
        const client = new OmniverseClient();
        const newViewer = await client.createViewer({
          container: containerRef.current
        });
        
        setViewer(newViewer);
        
        // Last inn modell hvis vi har en URL
        if (modelUrl) {
          await newViewer.loadModelFromUrl(modelUrl);
        } else if (modelData) {
          await newViewer.loadModelFromData(modelData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Feil ved initialisering av 3D-viewer:', err);
        setError('Kunne ikke laste 3D-modell. Prøv igjen senere.');
        setLoading(false);
      }
    };
    
    initViewer();
    
    // Cleanup
    return () => {
      if (viewer) {
        viewer.dispose();
      }
    };
  }, [property.id]);
  
  // Håndter vindusstørrelseendringer
  useEffect(() => {
    const handleResize = () => {
      if (viewer) {
        viewer.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [viewer]);
  
  // Håndter zoom-kontroller
  const handleZoomIn = () => {
    if (viewer) {
      viewer.zoomIn();
    }
  };
  
  const handleZoomOut = () => {
    if (viewer) {
      viewer.zoomOut();
    }
  };
  
  const handleResetCamera = () => {
    if (viewer) {
      viewer.resetCamera();
    }
  };
  
  return (
    <Box className={`${styles.container} ${className || ''}`}>
      {loading ? (
        <Box className={styles.loadingContainer}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Laster 3D-modell...
          </Typography>
        </Box>
      ) : error ? (
        <Box className={styles.errorContainer}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Prøv igjen
          </Button>
        </Box>
      ) : (
        <>
          <Box className={styles.viewerContainer} ref={containerRef} />
          <Stack direction="row" spacing={1} className={styles.controls}>
            <Button variant="outlined" onClick={handleZoomIn}>
              Zoom Inn
            </Button>
            <Button variant="outlined" onClick={handleZoomOut}>
              Zoom Ut
            </Button>
            <Button variant="outlined" onClick={handleResetCamera}>
              Tilbakestill
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default Property3DViewer;