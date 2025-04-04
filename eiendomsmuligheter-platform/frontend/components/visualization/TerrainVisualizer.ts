/**
 * TerrainVisualizer.ts
 * 
 * Klasse for visualisering av terreng og landskap for eiendommer
 * Bruker Three.js for å rendere terreng basert på høydedata
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface TerrainVisualizerOptions {
  container: HTMLElement;
  heightData?: number[][];
  resolution?: number;
  textureUrl?: string;
  heightScale?: number;
  size?: { width: number, height: number };
}

/**
 * TerrainVisualizer-klasse for 3D-visualisering av terreng
 */
export class TerrainVisualizer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private terrain: THREE.Mesh | null = null;
  private heightData: number[][];
  private resolution: number;
  private heightScale: number;
  private terrainSize: { width: number, height: number };
  private animationFrame: number | null = null;
  
  constructor(options: TerrainVisualizerOptions) {
    this.container = options.container;
    this.heightData = options.heightData || [[]];
    this.resolution = options.resolution || 128;
    this.heightScale = options.heightScale || 1.0;
    this.terrainSize = options.size || { width: 100, height: 100 };
    
    // Initialiser Three.js-komponenter
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeef4fb);
    
    // Opprett kamera
    const aspectRatio = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    this.camera.position.set(0, 50, 100);
    
    // Opprett renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    
    // Opprett kontroller
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Opprett lys
    this.setupLights();
    
    // Håndter vindustørrelseendringer
    window.addEventListener('resize', this.onWindowResize);
  }
  
  /**
   * Setter opp lys i scenen
   */
  private setupLights(): void {
    // Ambient lys for generell belysning
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Direksjonalt lys for skygger
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    
    // Konfigurer skyggekart
    const shadowSize = 100;
    directionalLight.shadow.camera.left = -shadowSize;
    directionalLight.shadow.camera.right = shadowSize;
    directionalLight.shadow.camera.top = shadowSize;
    directionalLight.shadow.camera.bottom = -shadowSize;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    this.scene.add(directionalLight);
  }
  
  /**
   * Genererer terreng basert på høydedata
   */
  public async generateTerrain(
    heightData?: number[][],
    textureUrl?: string,
    terrainSize?: { width: number, height: number },
    heightScale?: number
  ): Promise<void> {
    // Bruk nye parametere hvis angitt
    if (heightData) this.heightData = heightData;
    if (terrainSize) this.terrainSize = terrainSize;
    if (heightScale) this.heightScale = heightScale;
    
    // Sjekk om vi har høydedata
    if (!this.heightData || this.heightData.length === 0) {
      console.error('Ingen høydedata er tilgjengelig for terrengvisualisering');
      return;
    }
    
    // Fjern eksisterende terreng
    if (this.terrain) {
      this.scene.remove(this.terrain);
      (this.terrain.geometry as THREE.BufferGeometry).dispose();
      (this.terrain.material as THREE.Material).dispose();
    }
    
    // Opprett terrenggeometri
    const geometry = this.createTerrainGeometry();
    
    // Last inn terreng-tekstur hvis angitt
    let material: THREE.Material;
    if (textureUrl) {
      const textureLoader = new THREE.TextureLoader();
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(
          textureUrl,
          (texture) => resolve(texture),
          undefined,
          (error) => reject(error)
        );
      });
      
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.1
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: 0x77dd77,
        roughness: 0.8,
        metalness: 0.1,
        wireframe: false
      });
    }
    
    // Opprett terrengmesh
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.receiveShadow = true;
    this.terrain.castShadow = true;
    this.scene.add(this.terrain);
    
    // Sentrer kamera på terreng
    this.centerCameraOnTerrain();
    
    // Start rendering
    this.startRenderLoop();
  }
  
  /**
   * Oppretter terrenggeometri basert på høydedata
   */
  private createTerrainGeometry(): THREE.BufferGeometry {
    const { width, height } = this.terrainSize;
    const heightField = this.heightData;
    const rows = heightField.length;
    const cols = heightField[0].length;
    
    // Opprett plangeometri
    const geometry = new THREE.PlaneGeometry(
      width,
      height,
      cols - 1,
      rows - 1
    );
    
    // Roter geometri for å legge det horisontalt
    geometry.rotateX(-Math.PI / 2);
    
    // Hent verteks-posisjoner
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Juster høyde basert på høydedata
    for (let i = 0, j = 0; i < positions.length; i += 3, j++) {
      const x = Math.floor(j % cols);
      const y = Math.floor(j / cols);
      
      if (x < cols && y < rows) {
        // Juster y-komponenten (høyde) fra høydedata
        positions[i + 1] = heightField[y][x] * this.heightScale;
      }
    }
    
    // Oppdater normaler
    geometry.computeVertexNormals();
    
    return geometry;
  }
  
  /**
   * Oppretter tilfeldig terreng for testing
   */
  public generateRandomTerrain(
    resolution: number = 128,
    roughness: number = 0.5,
    size: { width: number, height: number } = { width: 100, height: 100 }
  ): void {
    this.resolution = resolution;
    this.terrainSize = size;
    
    const heightData = this.generatePerlinNoiseTerrain(resolution, resolution, roughness);
    this.generateTerrain(heightData, undefined, size);
  }
  
  /**
   * Genererer Perlin-støy for terreng
   */
  private generatePerlinNoiseTerrain(width: number, height: number, roughness: number): number[][] {
    // Enkel implementasjon av tilfeldig terreng
    // I en ekte implementering ville vi brukt Perlin-støy eller simplex-støy
    const terrain: number[][] = [];
    
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        let height = Math.sin(x / 10) * Math.cos(y / 10) * roughness * 5;
        height += Math.random() * roughness;
        row.push(height);
      }
      terrain.push(row);
    }
    
    // Smoothing
    for (let i = 0; i < 3; i++) {
      this.smoothTerrain(terrain);
    }
    
    return terrain;
  }
  
  /**
   * Utfører smoothing-operasjon på høydedata
   */
  private smoothTerrain(terrain: number[][]): void {
    const rows = terrain.length;
    const cols = terrain[0].length;
    const copy = terrain.map(row => [...row]);
    
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const avg = (
          copy[y-1][x-1] + copy[y-1][x] + copy[y-1][x+1] +
          copy[y][x-1] + copy[y][x] + copy[y][x+1] +
          copy[y+1][x-1] + copy[y+1][x] + copy[y+1][x+1]
        ) / 9;
        
        terrain[y][x] = avg;
      }
    }
  }
  
  /**
   * Sentrer kamera på terrenget
   */
  private centerCameraOnTerrain(): void {
    if (!this.terrain) return;
    
    const center = new THREE.Vector3();
    
    // Beregn terrengets sentrum
    center.x = 0;
    center.y = 0;
    center.z = 0;
    
    // Still inn kameraposisjon
    const distance = Math.max(this.terrainSize.width, this.terrainSize.height);
    this.camera.position.set(
      center.x,
      distance * 0.5,
      distance * 0.8
    );
    
    // Pek kamera mot sentrum av terrenget
    this.camera.lookAt(center);
    this.controls.target.copy(center);
    this.controls.update();
  }
  
  /**
   * Legger til overliggende elementer på terrenget
   */
  public addPropertyBoundary(coordinates: THREE.Vector2[]): void {
    if (!coordinates || coordinates.length < 3) return;
    
    // Opprett linje for eiendomsgrense
    const points: THREE.Vector3[] = [];
    
    for (const point of coordinates) {
      // Konverter fra terreng-koordinater til 3D-koordinater
      const x = point.x - this.terrainSize.width / 2;
      const z = point.y - this.terrainSize.height / 2;
      
      // Finn høyde på dette punktet (kan interpoleres mellom nærmeste høydeverdier)
      let y = 0;
      if (this.terrain) {
        y = this.getHeightAtPosition(x, z) + 0.1; // Litt over terrenget
      }
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    // Lukk sløyfen
    points.push(points[0].clone());
    
    // Opprett geometri og materiale
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
    
    // Opprett linje
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
  }
  
  /**
   * Henter høyden på et spesifikt punkt i terrenget
   */
  private getHeightAtPosition(x: number, z: number): number {
    if (!this.terrain) return 0;
    
    // Konverter fra 3D-koordinater til terreng-indekser
    const terrainX = (x + this.terrainSize.width / 2) / this.terrainSize.width * (this.heightData[0].length - 1);
    const terrainZ = (z + this.terrainSize.height / 2) / this.terrainSize.height * (this.heightData.length - 1);
    
    // Finn nærmeste heltallige indekser
    const x1 = Math.floor(terrainX);
    const x2 = Math.ceil(terrainX);
    const z1 = Math.floor(terrainZ);
    const z2 = Math.ceil(terrainZ);
    
    // Sikre at vi er innenfor grensene
    if (x1 < 0 || x2 >= this.heightData[0].length || z1 < 0 || z2 >= this.heightData.length) {
      return 0;
    }
    
    // Bilineær interpolasjon for å få nøyaktig høyde
    const xFrac = terrainX - x1;
    const zFrac = terrainZ - z1;
    
    const h1 = this.heightData[z1][x1];
    const h2 = this.heightData[z1][x2];
    const h3 = this.heightData[z2][x1];
    const h4 = this.heightData[z2][x2];
    
    // Interpoler
    const h12 = h1 * (1 - xFrac) + h2 * xFrac;
    const h34 = h3 * (1 - xFrac) + h4 * xFrac;
    
    return h12 * (1 - zFrac) + h34 * zFrac;
  }
  
  /**
   * Håndterer vindustørrelseendring
   */
  private onWindowResize = (): void => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * Start renderingsløkke
   */
  private startRenderLoop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    const animate = () => {
      this.animationFrame = requestAnimationFrame(animate);
      
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    
    animate();
  }
  
  /**
   * Rydd opp ressurser
   */
  public dispose(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Fjern event listeners
    window.removeEventListener('resize', this.onWindowResize);
    
    // Rydd opp Three.js-ressurser
    if (this.terrain) {
      this.scene.remove(this.terrain);
      (this.terrain.geometry as THREE.BufferGeometry).dispose();
      (this.terrain.material as THREE.Material).dispose();
    }
    
    // Fjern scenen
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
      this.scene.remove(object);
    }
    
    // Rydd opp renderer
    this.renderer.dispose();
    
    // Fjern canvas fra container
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
} 