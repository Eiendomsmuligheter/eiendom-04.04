import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Button, Stack, Tabs, Tab, Slider, Switch, FormControlLabel } from '@mui/material';
import { OmniverseClient, OmniverseViewer } from '../../services/omniverseService';
import { Property, BuildingModelData, BuildingFloor, BuildingWall, BuildingOpening, BuildingFeature } from '../../types/property';
import styles from '../../styles/ComparisonPropertyViewer.module.css';

interface ComparisonPropertyViewerProps {
  originalProperty: Property;
  modifiedProperty: Property;
  className?: string;
  changes?: PropertyChanges;
}

export interface PropertyChanges {
  addedWalls: string[];
  removedWalls: string[];
  modifiedWalls: string[];
  addedRooms: RoomChange[];
  modifiedRooms: RoomChange[];
  addedFeatures: string[];
  municipalRequirements: MunicipalRequirement[];
}

export interface RoomChange {
  id: string;
  name: string;
  type: string;
  area: number;
  description: string;
}

export interface MunicipalRequirement {
  id: string;
  name: string;
  description: string;
  status: 'fulfilled' | 'pending' | 'not_applicable';
  details?: string;
}

/**
 * Forbedret BuildingModelGenerator som støtter sammenligning av originale og modifiserte plantegninger
 */
class EnhancedBuildingModelGenerator {
  private model: BuildingModelData;
  private changes: PropertyChanges | undefined;
  private isOriginal: boolean;
  
  constructor(isOriginal: boolean = true, changes?: PropertyChanges) {
    this.model = {
      id: '',
      propertyId: '',
      version: '1.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      floors: []
    };
    this.changes = changes;
    this.isOriginal = isOriginal;
  }
  
  async generateModelFromData(property: Property): Promise<BuildingModelData> {
    this.model.propertyId = property.id;
    this.model.id = `model_${property.id}_${this.isOriginal ? 'original' : 'modified'}_${Date.now()}`;
    
    const floors = this.generateFloors(property);
    this.model.floors = floors;
    
    const walls = this.generateWalls(floors, property);
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
          name: i === 0 ? 'Grunnflate' : `Etasje ${i}`,
          isOriginal: this.isOriginal
        }
      });
    }
    
    return floors;
  }
  
  generateWalls(floors: BuildingFloor[], property: Property): BuildingWall[] {
    const walls: BuildingWall[] = [];
    
    floors.forEach(floor => {
      // Forenklet modell: Vi lager en boks med indre vegger basert på romfordeling
      const floorWidth = Math.sqrt(floor.area);
      const floorDepth = floorWidth;
      
      // Yttervegger
      const exteriorWalls = this.generateExteriorWalls(floor, floorWidth, floorDepth);
      walls.push(...exteriorWalls);
      
      // Indre vegger basert på romfordeling
      const interiorWalls = this.generateInteriorWalls(floor, floorWidth, floorDepth, property);
      walls.push(...interiorWalls);
    });
    
    return walls;
  }
  
  generateExteriorWalls(floor: BuildingFloor, width: number, depth: number): BuildingWall[] {
    const walls: BuildingWall[] = [];
    
    // Front wall
    walls.push({
      id: `wall_${floor.id}_front`,
      type: 'exterior',
      start: { x: 0, y: 0 },
      end: { x: width, y: 0 },
      height: floor.height,
      thickness: 0.25,
      properties: {
        floorId: floor.id,
        orientation: 'front',
        isOriginal: this.isOriginal,
        isModified: !this.isOriginal && this.changes?.modifiedWalls.includes(`wall_${floor.id}_front`)
      }
    });
    
    // Back wall
    walls.push({
      id: `wall_${floor.id}_back`,
      type: 'exterior',
      start: { x: 0, y: depth },
      end: { x: width, y: depth },
      height: floor.height,
      thickness: 0.25,
      properties: {
        floorId: floor.id,
        orientation: 'back',
        isOriginal: this.isOriginal,
        isModified: !this.isOriginal && this.changes?.modifiedWalls.includes(`wall_${floor.id}_back`)
      }
    });
    
    // Left wall
    walls.push({
      id: `wall_${floor.id}_left`,
      type: 'exterior',
      start: { x: 0, y: 0 },
      end: { x: 0, y: depth },
      height: floor.height,
      thickness: 0.25,
      properties: {
        floorId: floor.id,
        orientation: 'left',
        isOriginal: this.isOriginal,
        isModified: !this.isOriginal && this.changes?.modifiedWalls.includes(`wall_${floor.id}_left`)
      }
    });
    
    // Right wall
    walls.push({
      id: `wall_${floor.id}_right`,
      type: 'exterior',
      start: { x: width, y: 0 },
      end: { x: width, y: depth },
      height: floor.height,
      thickness: 0.25,
      properties: {
        floorId: floor.id,
        orientation: 'right',
        isOriginal: this.isOriginal,
        isModified: !this.isOriginal && this.changes?.modifiedWalls.includes(`wall_${floor.id}_right`)
      }
    });
    
    return walls;
  }
  
  generateInteriorWalls(floor: BuildingFloor, width: number, depth: number, property: Property): BuildingWall[] {
    const walls: BuildingWall[] = [];
    
    // Simuler romfordeling basert på property-data
    // I en ekte implementering ville dette vært basert på faktiske romdata
    
    // For modifisert modell, legg til vegger for utleiedel
    if (!this.isOriginal && this.changes) {
      // Legg til vegger for å skille utleiedel fra hovedbolig
      
      // Horisontal vegg som deler etasjen
      const dividerWall = {
        id: `wall_${floor.id}_divider_main`,
        type: 'interior',
        start: { x: 0, y: depth * 0.6 },
        end: { x: width, y: depth * 0.6 },
        height: floor.height,
        thickness: 0.15,
        properties: {
          floorId: floor.id,
          isNew: true,
          isOriginal: false,
          purpose: 'rental_unit_divider'
        }
      };
      walls.push(dividerWall);
      
      // Vertikal vegg for å lage gang til utleiedel
      const corridorWall = {
        id: `wall_${floor.id}_corridor`,
        type: 'interior',
        start: { x: width * 0.3, y: depth * 0.6 },
        end: { x: width * 0.3, y: depth },
        height: floor.height,
        thickness: 0.15,
        properties: {
          floorId: floor.id,
          isNew: true,
          isOriginal: false,
          purpose: 'rental_corridor'
        }
      };
      walls.push(corridorWall);
      
      // Vegg for å lage bad i utleiedel
      const bathroomWall1 = {
        id: `wall_${floor.id}_bathroom_1`,
        type: 'interior',
        start: { x: width * 0.3, y: depth * 0.6 },
        end: { x: width * 0.5, y: depth * 0.6 },
        height: floor.height,
        thickness: 0.15,
        properties: {
          floorId: floor.id,
          isNew: true,
          isOriginal: false,
          purpose: 'bathroom'
        }
      };
      walls.push(bathroomWall1);
      
      const bathroomWall2 = {
        id: `wall_${floor.id}_bathroom_2`,
        type: 'interior',
        start: { x: width * 0.5, y: depth * 0.6 },
        end: { x: width * 0.5, y: depth * 0.8 },
        height: floor.height,
        thickness: 0.15,
        properties: {
          floorId: floor.id,
          isNew: true,
          isOriginal: false,
          purpose: 'bathroom'
        }
      };
      walls.push(bathroomWall2);
      
      const bathroomWall3 = {
        id: `wall_${floor.id}_bathroom_3`,
        type: 'interior',
        start: { x: width * 0.3, y: depth * 0.8 },
        end: { x: width * 0.5, y: depth * 0.8 },
        height: floor.height,
        thickness: 0.15,
        properties: {
          floorId: floor.id,
          isNew: true,
          isOriginal: false,
          purpose: 'bathroom'
        }
      };
      walls.push(bathroomWall3);
      
      // Vegg for å lage kjøkken i utleiedel
      const kitchenWall = {
        id: `wall_${floor.id}_kitchen`,
        type: 'interior',
        start: { x: width * 0.7, y: depth * 0.6 },
        end: { x: width * 0.7, y: depth * 0.8 },
        height: floor.height,
        thickness: 0.15,
        properties: {
          floorId: floor.id,
          isNew: true,
          isOriginal: false,
          purpose: 'kitchen'
        }
      };
      walls.push(kitchenWall);
    } else {
      // For original modell, legg til noen standard innervegger
      
      // Horisontal vegg som deler etasjen
      const dividerWall = {
        id: `wall_${floor.id}_divider_original`,
        type: 'interior',
        start: { x: 0, y: depth * 0.5 },
        end: { x: width, y: depth * 0.5 },
        height: floor.height,
        thickness: 0.15,
        properties: {
          floorId: floor.id,
          isOriginal: true
        }
      };
      walls.push(dividerWall);
      
      // Vertikal vegg
      const verticalWall = {
        id: `wall_${floor.id}_vertical_original`,
        type: 'interior',
        start: { x: width * 0.5, y: 0 },
        end: { x: width * 0.5, y: depth * 0.5 },
        height: floor.height,
        thickness: 0.15,
        properties: {
          floorId: floor.id,
          isOriginal: true
        }
      };
      walls.push(verticalWall);
    }
    
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
          wallId: wall.id,
          properties: {
            isOriginal: this.isOriginal
          }
        });
      }
      
      // For modifisert modell, legg til separat inngang for utleiedel
      if (!this.isOriginal && wall.properties?.orientation === 'back' && wall.properties?.floorId === 'floor_0') {
        const wallLength = Math.sqrt(
          Math.pow(wall.end.x - wall.start.x, 2) + 
          Math.pow(wall.end.y - wall.start.y, 2)
        );
        
        openings.push({
          id: `door_rental_unit`,
          type: 'door',
          width: 1.0,
          height: 2.1,
          position: {
            x: wallLength * 0.2, // Plassert på venstre side av bakveggen
            y: 0,
            z: 0
          },
          wallId: wall.id,
          properties: {
            isNew: true,
            isOriginal: false,
            purpose: 'rental_entrance'
          }
        });
      }
      
      // Legg til dører for innvendige rom i modifisert modell
      if (!this.isOriginal && wall.type === 'interior') {
        if (wall.id === `wall_${wall.properties?.floorId}_divider_main`) {
          // Dør i skillevegg
          openings.push({
            id: `door_divider`,
            type: 'door',
            width: 0.9,
            height: 2.1,
            position: {
              x: 2.0, // Plassert på venstre side
              y: 0,
              z: 0
            },
            wallId: wall.id,
            properties: {
              isNew: true,
              isOriginal: false,
              purpose: 'rental_access'
            }
          });
        }
        
        if (wall.id === `wall_${wall.properties?.floorId}_bathroom_1`) {
          // Dør til bad
          openings.push({
            id: `door_bathroom`,
            type: 'door',
            width: 0.8,
            height: 2.1,
            position: {
              x: 1.0,
              y: 0,
              z: 0
            },
            wallId: wall.id,
            properties: {
              isNew: true,
              isOriginal: false,
              purpose: 'bathroom_access'
            }
          });
        }
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
          // For modifisert modell, legg til ekstra vindu for utleiedel
          const isRentalUnitWindow = !this.isOriginal && 
                                    wall.properties?.orientation === 'back' && 
                                    wall.properties?.floorId === 'floor_0' && 
                                    i === 0;
          
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
            wallId: wall.id,
            properties: {
              isOriginal: this.isOriginal,
              isNew: isRentalUnitWindow,
              purpose: isRentalUnitWindow ? 'rental_window' : undefined
            }
          });
        }
      }
    });
    
    return openings;
  }
  
  generateFeatures(property: Property): BuildingFeature[] {
    const features: BuildingFeature[] = [];
    
    // Legg til standard funksjoner basert på property-data
    if (property.features?.includes('swimming_pool')) {
      features.push({
        id: 'feature_swimming_pool',
        type: 'swimming_pool',
        name: 'Svømmebasseng',
        location: { x: 10, y: 10, z: 0 },
        dimensions: { width: 5, height: 2 },
        properties: {
          floorId: 'floor_0',
          material: 'tile',
          isOriginal: this.isOriginal
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
          capacity: 2,
          isOriginal: this.isOriginal
        }
      });
    }
    
    // For modifisert modell, legg til funksjoner for utleiedel
    if (!this.isOriginal) {
      // Legg til kjøkken for utleiedel
      features.push({
        id: 'feature_rental_kitchen',
        type: 'kitchen',
        name: 'Kjøkken (utleiedel)',
        location: { x: 7, y: 8, z: 0 },
        dimensions: { width: 2.5, height: 2.5 },
        properties: {
          floorId: 'floor_0',
          isNew: true,
          isOriginal: false,
          purpose: 'rental_kitchen'
        }
      });
      
      // Legg til bad for utleiedel
      features.push({
        id: 'feature_rental_bathroom',
        type: 'bathroom',
        name: 'Bad (utleiedel)',
        location: { x: 4, y: 7, z: 0 },
        dimensions: { width: 2, height: 2 },
        properties: {
          floorId: 'floor_0',
          isNew: true,
          isOriginal: false,
          purpose: 'rental_bathroom'
        }
      });
    }
    
    return features;
  }
}

/**
 * Komponent for å vise sammenligning mellom original og modifisert plantegning
 */
const ComparisonPropertyViewer: React.FC<ComparisonPropertyViewerProps> = ({
  originalProperty,
  modifiedProperty,
  className,
  changes
}) => {
  const originalContainerRef = useRef<HTMLDivElement>(null);
  const modifiedContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [originalViewer, setOriginalViewer] = useState<OmniverseViewer | null>(null);
  const [modifiedViewer, setModifiedViewer] = useState<OmniverseViewer | null>(null);
  const [originalModelData, setOriginalModelData] = useState<BuildingModelData | null>(null);
  const [modifiedModelData, setModifiedModelData] = useState<BuildingModelData | null>(null);
  const [viewMode, setViewMode] = useState<string>('side-by-side');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [highlightChanges, setHighlightChanges] = useState<boolean>(true);
  const [transparencyLevel, setTransparencyLevel] = useState<number>(50);
  const [showMunicipalRequirements, setShowMunicipalRequirements] = useState<boolean>(true);
  
  // Initialiser viewere
  useEffect(() => {
    const initViewers = async () => {
      if (!originalContainerRef.current || !modifiedContainerRef.current) return;
      
      try {
        setLoading(true);
        
        // Generer modeller lokalt
        const originalGenerator = new EnhancedBuildingModelGenerator(true);
        const generatedOriginalModel = await originalGenerator.generateModelFromData(originalProperty);
        setOriginalModelData(generatedOriginalModel);
        
        const modifiedGenerator = new EnhancedBuildingModelGenerator(false, changes);
        const generatedModifiedModel = await modifiedGenerator.generateModelFromData(modifiedProperty);
        setModifiedModelData(generatedModifiedModel);
        
        // Opprett Omniverse-klienter og viewere
        const client = new OmniverseClient();
        
        const newOriginalViewer = await client.createViewer({
          container: originalContainerRef.current,
          settings: {
            quality: 'high',
            shadows: true
          }
        });
        setOriginalViewer(newOriginalViewer);
        
        const newModifiedViewer = await client.createViewer({
          container: modifiedContainerRef.current,
          settings: {
            quality: 'high',
            shadows: true
          }
        });
        setModifiedViewer(newModifiedViewer);
        
        // Last inn modeller
        if (generatedOriginalModel) {
          await newOriginalViewer.loadModelFromData(generatedOriginalModel);
        }
        
        if (generatedModifiedModel) {
          await newModifiedViewer.loadModelFromData(generatedModifiedModel);
        }
        
        // Synkroniser kameraposisjoner
        syncCameras(newOriginalViewer, newModifiedViewer);
        
        setLoading(false);
      } catch (err) {
        console.error('Feil ved initialisering av 3D-viewere:', err);
        setError('Kunne ikke laste 3D-modeller. Prøv igjen senere.');
        setLoading(false);
      }
    };
    
    initViewers();
    
    // Cleanup
    return () => {
      if (originalViewer) {
        originalViewer.dispose();
      }
      if (modifiedViewer) {
        modifiedViewer.dispose();
      }
    };
  }, [originalProperty.id, modifiedProperty.id]);
  
  // Synkroniser kameraposisjoner mellom viewere
  const syncCameras = (viewer1: OmniverseViewer, viewer2: OmniverseViewer) => {
    // Implementer synkronisering av kameraposisjoner mellom viewere
    // Dette ville i en faktisk implementasjon koble sammen kamerabevegelser
    console.log('Synkroniserer kameraer mellom viewere');
  };
  
  // Håndter endring av visningsmodus
  const handleViewModeChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    switch (newValue) {
      case 0:
        setViewMode('side-by-side');
        break;
      case 1:
        setViewMode('overlay');
        break;
      case 2:
        setViewMode('split');
        break;
    }
  };
  
  // Håndter endring av transparensnivå
  const handleTransparencyChange = (event: Event, newValue: number | number[]) => {
    setTransparencyLevel(newValue as number);
    
    // I en faktisk implementasjon ville vi oppdatert materialenes gjennomsiktighet
    // basert på det nye transparensnivået
  };
  
  // Håndter zoom-kontroller
  const handleZoomIn = () => {
    if (originalViewer) {
      originalViewer.zoomIn();
    }
    if (modifiedViewer && viewMode === 'side-by-side') {
      modifiedViewer.zoomIn();
    }
  };
  
  const handleZoomOut = () => {
    if (originalViewer) {
      originalViewer.zoomOut();
    }
    if (modifiedViewer && viewMode === 'side-by-side') {
      modifiedViewer.zoomOut();
    }
  };
  
  const handleResetCamera = () => {
    if (originalViewer) {
      originalViewer.resetCamera();
    }
    if (modifiedViewer && viewMode === 'side-by-side') {
      modifiedViewer.resetCamera();
    }
  };
  
  // Håndter endring av visningsmodus for 3D-viewere
  const handle3DViewModeChange = (mode: string) => {
    if (originalViewer) {
      originalViewer.setViewMode(mode);
    }
    if (modifiedViewer) {
      modifiedViewer.setViewMode(mode);
    }
  };
  
  // Render endringsliste
  const renderChangesList = () => {
    if (!changes) return null;
    
    return (
      <Box className={styles.changesContainer}>
        <Typography variant="h6" gutterBottom>
          Endringer i plantegning
        </Typography>
        
        {changes.addedRooms.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Nye rom
            </Typography>
            <ul className={styles.changesList}>
              {changes.addedRooms.map((room, index) => (
                <li key={index} className={styles.changeItem}>
                  <Typography variant="body2">
                    {room.name} ({room.area} m²) - {room.description}
                  </Typography>
                </li>
              ))}
            </ul>
          </>
        )}
        
        {changes.modifiedRooms.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Endrede rom
            </Typography>
            <ul className={styles.changesList}>
              {changes.modifiedRooms.map((room, index) => (
                <li key={index} className={styles.changeItem}>
                  <Typography variant="body2">
                    {room.name} - {room.description}
                  </Typography>
                </li>
              ))}
            </ul>
          </>
        )}
        
        {changes.addedFeatures.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Nye funksjoner
            </Typography>
            <ul className={styles.changesList}>
              {changes.addedFeatures.map((feature, index) => (
                <li key={index} className={styles.changeItem}>
                  <Typography variant="body2">
                    {feature}
                  </Typography>
                </li>
              ))}
            </ul>
          </>
        )}
      </Box>
    );
  };
  
  // Render kommunale krav
  const renderMunicipalRequirements = () => {
    if (!changes || !changes.municipalRequirements) return null;
    
    return (
      <Box className={styles.requirementsContainer}>
        <Typography variant="h6" gutterBottom>
          Kommunale krav
        </Typography>
        
        <ul className={styles.requirementsList}>
          {changes.municipalRequirements.map((req, index) => (
            <li key={index} className={styles.requirementItem}>
              <Box display="flex" alignItems="center">
                <Box 
                  className={`${styles.statusIndicator} ${
                    req.status === 'fulfilled' 
                      ? styles.statusFulfilled 
                      : req.status === 'pending' 
                        ? styles.statusPending 
                        : styles.statusNotApplicable
                  }`} 
                />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {req.name}
                  </Typography>
                  <Typography variant="body2">
                    {req.description}
                  </Typography>
                  {req.details && (
                    <Typography variant="body2" color="textSecondary">
                      {req.details}
                    </Typography>
                  )}
                </Box>
              </Box>
            </li>
          ))}
        </ul>
      </Box>
    );
  };
  
  return (
    <Box className={`${styles.comparisonContainer} ${className || ''}`}>
      {loading ? (
        <Box className={styles.loadingContainer}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Laster 3D-modeller...
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
          <Box className={styles.controlsContainer}>
            <Tabs value={activeTab} onChange={handleViewModeChange} centered>
              <Tab label="Side ved side" />
              <Tab label="Overlegg" />
              <Tab label="Delt visning" />
            </Tabs>
            
            <Box className={styles.viewControls}>
              <Button variant="outlined" onClick={() => handle3DViewModeChange('3d')}>
                3D-visning
              </Button>
              <Button variant="outlined" onClick={() => handle3DViewModeChange('floor-plan')}>
                Plantegning
              </Button>
              <Button variant="outlined" onClick={() => handle3DViewModeChange('section')}>
                Snitt
              </Button>
            </Box>
            
            <Box className={styles.optionsControls}>
              <FormControlLabel
                control={
                  <Switch
                    checked={highlightChanges}
                    onChange={(e) => setHighlightChanges(e.target.checked)}
                  />
                }
                label="Fremhev endringer"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={showMunicipalRequirements}
                    onChange={(e) => setShowMunicipalRequirements(e.target.checked)}
                  />
                }
                label="Vis kommunale krav"
              />
              
              {viewMode === 'overlay' && (
                <Box className={styles.transparencyControl}>
                  <Typography variant="body2">Gjennomsiktighet</Typography>
                  <Slider
                    value={transparencyLevel}
                    onChange={handleTransparencyChange}
                    min={0}
                    max={100}
                    step={5}
                  />
                </Box>
              )}
            </Box>
          </Box>
          
          <Box className={styles.viewersContainer}>
            <Box className={styles.viewerWrapper} style={{ width: viewMode === 'side-by-side' ? '50%' : '100%' }}>
              <Typography variant="subtitle1" className={styles.viewerTitle}>
                Original plantegning
              </Typography>
              <Box className={styles.viewerContainer} ref={originalContainerRef} />
            </Box>
            
            {viewMode === 'side-by-side' && (
              <Box className={styles.viewerWrapper} style={{ width: '50%' }}>
                <Typography variant="subtitle1" className={styles.viewerTitle}>
                  Modifisert plantegning med utleiedel
                </Typography>
                <Box className={styles.viewerContainer} ref={modifiedContainerRef} />
              </Box>
            )}
          </Box>
          
          <Stack direction="row" spacing={1} className={styles.navigationControls}>
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
          
          <Box className={styles.infoContainer}>
            {renderChangesList()}
            {showMunicipalRequirements && renderMunicipalRequirements()}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ComparisonPropertyViewer;
