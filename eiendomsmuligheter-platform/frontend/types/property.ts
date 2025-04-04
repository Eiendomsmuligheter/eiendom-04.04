/**
 * property.ts
 * 
 * TypeScript-definisjoner for eiendomsrelaterte datastrukturer
 */

export interface Address {
  street: string;
  number: string;
  apartment?: string;
  postalCode: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyDimensions {
  length: number;
  width: number;
  height: number;
  area: number;
  volume?: number;
}

export interface BuildingFeature {
  id: string;
  type: string;
  name: string;
  description?: string;
  location: {
    x: number;
    y: number;
    z: number;
  };
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
  };
  properties?: Record<string, any>;
}

export interface BuildingOpening {
  id: string;
  type: 'door' | 'window' | 'skylight' | 'other';
  width: number;
  height: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  wallId?: string;
  properties?: Record<string, any>;
}

export interface BuildingWall {
  id: string;
  type: 'exterior' | 'interior' | 'load-bearing' | 'partition';
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  height: number;
  thickness: number;
  material?: string;
  openings?: BuildingOpening[];
  properties?: Record<string, any>;
}

export interface BuildingFloor {
  id: string;
  level: number;
  height: number;
  area: number;
  elevation: number;
  rooms?: BuildingRoom[];
  walls?: BuildingWall[];
  openings?: BuildingOpening[];
  features?: BuildingFeature[];
  properties?: Record<string, any>;
}

export interface BuildingRoom {
  id: string;
  name: string;
  type: string;
  area: number;
  floorId: string;
  walls: string[]; // Referanser til BuildingWall.id
  properties?: Record<string, any>;
}

export interface BuildingModelData {
  id: string;
  propertyId: string;
  version: string;
  created: string;
  updated: string;
  floors: BuildingFloor[];
  properties?: Record<string, any>;
}

export interface PropertyMedia {
  id: string;
  type: 'image' | 'video' | '3d_model' | 'document';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  uploadDate: string;
  tags?: string[];
}

export interface PropertyOwnership {
  ownerId: string;
  ownerName: string;
  ownerType: 'person' | 'company' | 'organization';
  ownershipPercentage: number;
  acquisitionDate?: string;
}

export interface PropertyValuation {
  id: string;
  value: number;
  currency: string;
  date: string;
  type: 'tax' | 'market' | 'insurance' | 'bank';
  assessorId?: string;
  assessorName?: string;
  notes?: string;
}

export interface PropertyEnergyData {
  energyClass?: string;
  heatingSystem?: string;
  annualConsumption?: number; // kWh per år
  energySource?: string[];
  certificationDate?: string;
  renovationPotential?: string;
}

export interface PropertyTaxInfo {
  taxId?: string;
  annualTax?: number;
  taxAssessmentValue?: number;
  taxZone?: string;
  exemptions?: string[];
  lastAssessmentDate?: string;
}

export interface Property {
  id: string;
  name?: string;
  type: 'residential' | 'commercial' | 'industrial' | 'land' | 'mixed';
  subType?: string;
  status: 'available' | 'sold' | 'leased' | 'under_development' | 'off_market';
  address: Address;
  dimensions: PropertyDimensions;
  description?: string;
  constructionYear?: number;
  renovationYear?: number;
  numberOfFloors?: number;
  ownership?: PropertyOwnership[];
  valuations?: PropertyValuation[];
  energyData?: PropertyEnergyData;
  taxInfo?: PropertyTaxInfo;
  media?: PropertyMedia[];
  buildingModel?: BuildingModelData;
  features?: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface PropertyListItem {
  id: string;
  name?: string;
  type: string;
  address: Address;
  status: string;
  area: number;
  price?: number;
  currency?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface BuildingModelGenerator {
  generateModelFromData(property: Property): Promise<BuildingModelData>;
  generateWalls(floors: BuildingFloor[]): BuildingWall[];
  generateFloors(property: Property): BuildingFloor[];
  generateOpenings(walls: BuildingWall[]): BuildingOpening[];
  generateFeatures(property: Property): BuildingFeature[];
  exportToGLTF(modelData: BuildingModelData): Promise<Blob>;
  exportToJSON(modelData: BuildingModelData): string;
} 