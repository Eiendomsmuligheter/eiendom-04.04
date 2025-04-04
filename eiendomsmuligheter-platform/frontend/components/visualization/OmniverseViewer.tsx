import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { 
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as ResetIcon,
  Palette as PaletteIcon,
  BrightnessHigh as LightIcon,
  Home as HomeIcon,
  ThreeDRotation as RotateIcon
} from '@mui/icons-material';
import { OmniverseClient, OmniverseViewer as OmniverseViewerClass } from '../../services/omniverseService';
import styles from '../../styles/OmniverseViewer.module.css';

interface OmniverseViewerProps {
  modelUrl?: string;
  modelId?: string;
  propertyId?: string;
  showControls?: boolean;
  quality?: 'low' | 'medium' | 'high';
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export const OmniverseViewer: React.FC<OmniverseViewerProps> = ({
  modelUrl,
  modelId,
  propertyId,
  showControls = true,
  quality = 'high',
  className,
  onError,
  onLoad
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OmniverseViewerClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialiser viewer
  useEffect(() => {
    const initializeViewer = async () => {
      try {
        if (!containerRef.current) return;
        
        // Initialiser Omniverse klient
        const client = new OmniverseClient();
        
        // Opprett viewer-instans
        viewerRef.current = await client.createViewer({
          container: containerRef.current,
          settings: {
            quality,
            shadows: quality !== 'low',
            lighting: 'physical',
            background: 'environment'
          }
        });
        
        // Last inn standard miljø
        await viewerRef.current.loadEnvironment('daylight');
        
        // Last inn modell om tilgjengelig
        if (modelUrl) {
          await loadModel(modelUrl);
        } else if (propertyId && modelId) {
          await loadPropertyModel(propertyId, modelId);
        }
        
        if (onLoad) {
          onLoad();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Ukjent feil ved initialisering av 3D-visning');
        handleError(error);
      }
    };
    
    initializeViewer();
    
    return () => {
      // Rydd opp viewer når komponenten avmonteres
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, []);
  
  // Last inn modell fra URL
  const loadModel = async (url: string) => {
    if (!viewerRef.current) return;
    
    try {
      setIsLoading(true);
      
      // Simuler 3D-modell-lasting
      const model = { url, type: 'gltf' };
      await viewerRef.current.loadModel(model);
      
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Kunne ikke laste 3D-modell');
      handleError(error);
    }
  };
  
  // Last inn modell fra eiendoms-ID og modell-ID
  const loadPropertyModel = async (propertyId: string, modelId: string) => {
    try {
      setIsLoading(true);
      
      // Initialiser Omniverse klient
      const client = new OmniverseClient();
      
      // Hent modelldata fra API
      const modelData = await client.getPropertyModel(propertyId, modelId);
      
      // Last inn modell hvis viewer er initialisert
      if (viewerRef.current) {
        await viewerRef.current.loadModel(modelData);
      }
      
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Kunne ikke laste 3D-modell fra server');
      handleError(error);
    }
  };
  
  // Håndter feil
  const handleError = (err: Error) => {
    console.error('3D-visningsfeil:', err);
    setError(err.message);
    setIsLoading(false);
    
    if (onError) {
      onError(err);
    }
  };
  
  // Håndter kamera-kontroller
  const handleZoomIn = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomIn();
    }
  };
  
  const handleZoomOut = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomOut();
    }
  };
  
  const handleResetCamera = () => {
    if (viewerRef.current) {
      viewerRef.current.centerCameraOnModel();
    }
  };
  
  return (
    <Box 
      ref={containerRef}
      className={`${styles.container} ${className}`}
      data-testid="omniverse-viewer"
    >
      {isLoading && (
        <Box className={styles.loading}>
          <CircularProgress />
          <p>Laster 3D-modell...</p>
        </Box>
      )}
      
      {error && (
        <Box className={styles.error}>
          <p>{error}</p>
        </Box>
      )}
      
      {showControls && !isLoading && !error && (
        <Box className={styles.controls}>
          <Tooltip title="Zoom inn">
            <IconButton onClick={handleZoomIn} className={styles.controlButton}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom ut">
            <IconButton onClick={handleZoomOut} className={styles.controlButton}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Tilbakestill kamera">
            <IconButton onClick={handleResetCamera} className={styles.controlButton}>
              <ResetIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}; 