/**
 * omniverseService.ts
 * 
 * Tjenestemodul for interaksjon med NVIDIA Omniverse-plattformen
 * og andre 3D-teknologier for eiendomsvisualisering.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { BuildingModelData } from '../types/property';

/**
 * Innstillinger for Omniverse 3D-viewer
 */
export interface OmniverseViewerSettings {
  container: HTMLElement;
  settings?: {
    quality?: 'low' | 'medium' | 'high';
    shadows?: boolean;
    lighting?: 'basic' | 'physical' | 'studio';
    background?: 'solid' | 'gradient' | 'environment';
  };
}

/**
 * Klient for å interagere med Omniverse-tjenester
 */
export class OmniverseClient {
  private apiEndpoint: string = '/api/omniverse';
  private token: string | null = null;
  
  constructor(token?: string) {
    if (token) {
      this.token = token;
    }
  }
  
  /**
   * Oppretter en 3D-viewer for eiendomsvisualisering
   */
  public async createViewer(options: OmniverseViewerSettings): Promise<OmniverseViewer> {
    // Opprett en viewer-instans
    const viewer = new OmniverseViewer(options);
    await viewer.initialize();
    return viewer;
  }
  
  /**
   * Genererer en 3D-modell for en eiendom
   */
  public async generatePropertyModel(propertyId: string, options: any = {}): Promise<any> {
    try {
      const response = await fetch(`${this.apiEndpoint}/properties/${propertyId}/model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate model: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating property model:', error);
      throw error;
    }
  }
  
  /**
   * Henter en eksisterende 3D-modell
   */
  public async getPropertyModel(propertyId: string, modelId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiEndpoint}/properties/${propertyId}/model/${modelId}`, {
        method: 'GET',
        headers: {
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get model: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting property model:', error);
      throw error;
    }
  }
}

/**
 * Omniverse 3D-viewer klasse for eiendomsvisualisering
 */
export class OmniverseViewer {
  private container: HTMLElement;
  private settings: OmniverseViewerSettings['settings'];
  
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  public controls: OrbitControls | null = null;
  private model: THREE.Group | null = null;
  private environment: THREE.Texture | null = null;
  
  private animationFrame: number | null = null;
  private isInitialized: boolean = false;
  private isWireframe: boolean = false;
  private isMeasurementMode: boolean = false;
  private currentViewMode: string = '3d';
  private originalCameraPosition: THREE.Vector3 | null = null;
  
  constructor(options: OmniverseViewerSettings) {
    this.container = options.container;
    this.settings = options.settings || {
      quality: 'high',
      shadows: true,
      lighting: 'physical',
      background: 'environment'
    };
    
    // Legger til event listeners for ekstern kontroll
    this.setupExternalControls();
  }
  
  // Setter opp event listeners for å kontrollere vieweren fra utsiden
  private setupExternalControls(): void {
    this.container.addEventListener('viewer-zoom-in', () => {
      this.zoomIn();
    });
    
    this.container.addEventListener('viewer-zoom-out', () => {
      this.zoomOut();
    });
    
    this.container.addEventListener('viewer-reset-camera', () => {
      this.centerCameraOnModel();
    });
  }
  
  /**
   * Initialiserer 3D-sceneri med Three.js
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Opprett scene
    this.scene = new THREE.Scene();
    
    // Oppsett av kamera
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 5, 10);
    this.originalCameraPosition = this.camera.position.clone();
    
    // Oppsett av renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = this.settings?.shadows || false;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);
    
    // Oppsett av kontroller
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Legg til lys
    this.setupLights();
    
    // Håndter vindustørrelseendringer
    window.addEventListener('resize', this.onResize);
    
    // Start renderingsløkke
    this.startRenderLoop();
    
    this.isInitialized = true;
  }
  
  /**
   * Zoom inn kameraet
   */
  public zoomIn(): void {
    if (!this.camera) return;
    
    // Flytt kameraet nærmere
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    
    // Flytt kamera fremover i kameraets retning
    const step = 1; // Juster zoom-hastighet etter behov
    this.camera.position.addScaledVector(direction, step);
    
    if (this.controls) {
      this.controls.update();
    }
  }
  
  /**
   * Zoom ut kameraet
   */
  public zoomOut(): void {
    if (!this.camera) return;
    
    // Flytt kameraet lenger unna
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    
    // Flytt kamera bakover fra kameraets retning
    const step = -1; // Juster zoom-hastighet etter behov
    this.camera.position.addScaledVector(direction, step);
    
    if (this.controls) {
      this.controls.update();
    }
  }
  
  /**
   * Tilbakestill kameraet til standardposisjon
   */
  public resetCamera(): void {
    if (!this.camera || !this.controls || !this.originalCameraPosition) return;
    
    // Tilbakestill kamera til originalposisjon
    this.camera.position.copy(this.originalCameraPosition);
    
    // Tilbakestill kontroller
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
  
  /**
   * Slå av/på trådmodellvisning
   */
  public toggleWireframe(): void {
    if (!this.model) return;
    
    this.isWireframe = !this.isWireframe;
    
    // Sett wireframe for alle materialer i modellen
    this.model.traverse(child => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.wireframe = this.isWireframe;
          });
        } else {
          child.material.wireframe = this.isWireframe;
        }
      }
    });
  }
  
  /**
   * Slå av/på måleverktøy
   */
  public toggleMeasurementMode(): void {
    this.isMeasurementMode = !this.isMeasurementMode;
    
    // I en ekte implementering ville dette aktivert et eget UI-lag
    // for å utføre målinger av avstand, arealer, etc.
    console.log(`Målemodus ${this.isMeasurementMode ? 'aktivert' : 'deaktivert'}`);
    
    // Her kunne vi lagt til funksjonalitet for å vise/skjule målelinjer
    // og interaksjoner for å måle avstander i 3D-scenen
  }
  
  /**
   * Sett visningsmodus (3D, plantegning, snitt, osv.)
   */
  public setViewMode(mode: string): void {
    if (!this.camera || !this.controls || !this.scene) return;
    
    this.currentViewMode = mode;
    
    switch (mode) {
      case '3d':
        // Standard 3D-visning
        this.resetCamera();
        break;
        
      case 'floor-plan': 
        // Plantegning (sett ovenfra)
        this.camera.position.set(0, 50, 0);
        this.camera.lookAt(0, 0, 0);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        break;
        
      case 'section':
        // Snitt (sett fra siden)
        this.camera.position.set(50, 10, 0);
        this.camera.lookAt(0, 0, 0);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        break;
        
      case 'elevation':
        // Fasade (sett forfra)
        this.camera.position.set(0, 10, 50);
        this.camera.lookAt(0, 0, 0);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        break;
    }
  }
  
  /**
   * Sentrer kameraet på modellen
   */
  public centerCameraOnModel(): void {
    if (!this.model || !this.camera || !this.controls) return;
    
    // Beregn bounding box for modellen
    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Beregn avstand basert på størrelsen
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Legg til litt ekstra avstand
    cameraZ *= 1.5;
    
    // Sett kameraposisjon
    this.camera.position.set(center.x, center.y + size.y / 4, center.z + cameraZ);
    this.camera.lookAt(center);
    
    // Oppdater kontroller
    this.controls.target.copy(center);
    this.controls.update();
  }
  
  /**
   * Oppsett av lys i scenen
   */
  private setupLights(): void {
    if (!this.scene) return;
    
    // Ambient lys
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Directional lys (sol)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = this.settings?.shadows || false;
    
    // Skyggeinnstillinger
    if (directionalLight.castShadow) {
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -20;
      directionalLight.shadow.camera.right = 20;
      directionalLight.shadow.camera.top = 20;
      directionalLight.shadow.camera.bottom = -20;
    }
    
    this.scene.add(directionalLight);
    
    // Hemisphere lys (himmel/bakke)
    const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 0.5);
    this.scene.add(hemisphereLight);
  }
  
  /**
   * Laster inn en miljøkart for bakgrunn og refleksjoner
   */
  public async loadEnvironment(environmentType: string = 'daylight'): Promise<void> {
    if (!this.scene) return;
    
    const environments: Record<string, string> = {
      'daylight': '/assets/environments/daylight.hdr',
      'sunset': '/assets/environments/sunset.hdr',
      'night': '/assets/environments/night.hdr',
      'studio': '/assets/environments/studio.hdr'
    };
    
    // Håndter fall-tilbake til standard
    const envPath = environments[environmentType] || environments['daylight'];
    
    try {
      // Simuler lasting av HDR (i en faktisk implementering ville vi brukt RGBELoader)
      console.log(`Laster miljø: ${envPath}`);
      // Simuler lasting av bakgrunn
      this.scene.background = new THREE.Color(0xf5f5f5);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Feil ved lasting av miljø:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Laster inn en 3D-modell fra en URL
   */
  public async loadModelFromUrl(url: string): Promise<void> {
    if (!this.scene) return;
    
    try {
      // Fjern eksisterende modell
      if (this.model) {
        this.scene.remove(this.model);
        this.model = null;
      }
      
      // Last inn modell fra URL
      const loader = new GLTFLoader();
      
      // For JSON-filer, last inn og konverter til Three.js-objekter
      if (url.endsWith('.json')) {
        const response = await fetch(url);
        const modelData = await response.json();
        
        // Konverter BuildingModelData til Three.js-objekter
        this.model = this.createModelFromData(modelData);
        this.scene.add(this.model);
        
        // Sentrer kamera på modellen
        this.centerCameraOnModel();
      } else {
        // For GLTF/GLB-filer, bruk GLTFLoader
        const gltf = await new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            url,
            (gltf) => resolve(gltf.scene),
            undefined,
            (error) => reject(error)
          );
        });
        
        this.model = gltf;
        this.scene.add(this.model);
        
        // Sentrer kamera på modellen
        this.centerCameraOnModel();
      }
    } catch (error) {
      console.error('Error loading model from URL:', error);
      throw error;
    }
  }
  
  /**
   * Laster inn en 3D-modell fra BuildingModelData
   */
  public async loadModelFromData(modelData: BuildingModelData): Promise<void> {
    if (!this.scene) return;
    
    try {
      // Fjern eksisterende modell
      if (this.model) {
        this.scene.remove(this.model);
        this.model = null;
      }
      
      // Konverter BuildingModelData til Three.js-objekter
      this.model = this.createModelFromData(modelData);
      this.scene.add(this.model);
      
      // Sentrer kamera på modellen
      this.centerCameraOnModel();
    } catch (error) {
      console.error('Error loading model from data:', error);
      throw error;
    }
  }
  
  /**
   * Konverterer BuildingModelData til Three.js-objekter
   */
  private createModelFromData(modelData: BuildingModelData): THREE.Group {
    const group = new THREE.Group();
    
    // Opprett materialer
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.6
    });
    
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.5,
      metalness: 0.2
    });
    
    // Opprett etasjer
    modelData.floors.forEach(floor => {
      const floorGroup = new THREE.Group();
      floorGroup.name = floor.id;
      floorGroup.position.y = floor.elevation;
      
      // Opprett gulv
      const floorGeometry = new THREE.BoxGeometry(
        Math.sqrt(floor.area),
        0.1,
        Math.sqrt(floor.area)
      );
      const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.position.y = -0.05; // Litt under etasjen
      floorMesh.receiveShadow = true;
      floorGroup.add(floorMesh);
      
      // Opprett vegger
      floor.walls?.forEach(wall => {
        const wallGroup = new THREE.Group();
        wallGroup.name = wall.id;
        
        // Beregn veggdimensjoner
        const start = new THREE.Vector2(wall.start.x, wall.start.y);
        const end = new THREE.Vector2(wall.end.x, wall.end.y);
        const length = start.distanceTo(end);
        const direction = new THREE.Vector2().subVectors(end, start).normalize();
        const angle = Math.atan2(direction.y, direction.x);
        
        // Opprett vegg
        const wallGeometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        
        // Plasser vegg
        wallMesh.position.set(
          (start.x + end.x) / 2,
          wall.height / 2,
          (start.y + end.y) / 2
        );
        
        // Roter vegg
        wallMesh.rotation.y = -angle;
        
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wallGroup.add(wallMesh);
        
        // Legg til åpninger (dører og vinduer)
        wall.openings?.forEach(opening => {
          let openingGeometry;
          let openingMaterial;
          
          if (opening.type === 'door') {
            openingGeometry = new THREE.BoxGeometry(opening.width, opening.height, wall.thickness * 1.1);
            openingMaterial = doorMaterial;
          } else {
            openingGeometry = new THREE.BoxGeometry(opening.width, opening.height, wall.thickness * 1.1);
            openingMaterial = windowMaterial;
          }
          
          const openingMesh = new THREE.Mesh(openingGeometry, openingMaterial);
          
          // Plasser åpning
          const posX = start.x + opening.position.x * direction.x;
          const posZ = start.y + opening.position.x * direction.y;
          
          openingMesh.position.set(
            posX,
            opening.position.z + opening.height / 2,
            posZ
          );
          
          // Roter åpning
          openingMesh.rotation.y = -angle;
          
          openingMesh.castShadow = true;
          wallGroup.add(openingMesh);
        });
        
        floorGroup.add(wallGroup);
      });
      
      group.add(floorGroup);
    });
    
    return group;
  }
  
  /**
   * Håndterer vindustørrelseendringer
   */
  private onResize = (): void => {
    if (!this.camera || !this.renderer) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  };
  
  /**
   * Starter renderingsløkken
   */
  private startRenderLoop(): void {
    if (!this.scene || !this.camera || !this.renderer) return;
    
    const animate = () => {
      this.animationFrame = requestAnimationFrame(animate);
      
      // Oppdater kontroller
      if (this.controls) {
        this.controls.update();
      }
      
      // Render scene
      this.renderer?.render(this.scene!, this.camera!);
    };
    
    animate();
  }
  
  /**
   * Oppdaterer størrelsen på vieweren
   */
  public resize(): void {
    this.onResize();
  }
  
  /**
   * Rydder opp ressurser når vieweren ikke lenger brukes
   */
  public dispose(): void {
    // Stopp renderingsløkke
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Fjern event listeners
    window.removeEventListener('resize', this.onResize);
    
    // Fjern renderer fra DOM
    if (this.renderer) {
      this.container.removeChild(this.renderer.domElement);
    }
    
    // Fjern referanser til Three.js-objekter
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
  }
} 