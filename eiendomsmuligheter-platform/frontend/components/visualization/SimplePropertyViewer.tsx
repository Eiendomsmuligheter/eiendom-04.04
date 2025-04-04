"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, RotateCw, Home, Grid3X3, Info } from 'lucide-react';

interface BuildingOption {
  type: string;
  maxSize: number;
  estimatedCost: number;
  estimatedValue: number;
  roi: number;
}

interface PropertyData {
  id: string;
  address: string;
  municipality: string;
  plotSize: number;
  zoning: string;
  allowedBuildingHeight: number;
  maxBuildableArea: number;
  buildingOptions?: BuildingOption[];
  zoneRestrictions?: string[];
}

interface SimplePropertyViewerProps {
  propertyId: string;
  initialData?: PropertyData;
}

export function SimplePropertyViewer({ propertyId, initialData }: SimplePropertyViewerProps) {
  const [data, setData] = useState<PropertyData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'plot' | 'building' | 'restrictions'>('plot');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  
  // Simulere lasting av data hvis det ikke ble gitt initialData
  useEffect(() => {
    if (!initialData && propertyId) {
      setLoading(true);
      
      // Simulerer API-kall med setTimeout
      const timer = setTimeout(() => {
        // Mockdata for Solbergveien 47
        if (propertyId === 'solbergveien-47') {
          setData({
            id: 'solbergveien-47',
            address: 'Solbergveien 47, 3057 Solbergmoen',
            municipality: 'Drammen',
            plotSize: 850,
            zoning: 'Bolig',
            allowedBuildingHeight: 9,
            maxBuildableArea: 420,
            buildingOptions: [
              {
                type: 'Enebolig',
                maxSize: 250,
                estimatedCost: 6250000,
                estimatedValue: 8500000,
                roi: 36
              },
              {
                type: 'Tomannsbolig',
                maxSize: 380,
                estimatedCost: 9500000,
                estimatedValue: 12800000,
                roi: 34.7
              }
            ],
            zoneRestrictions: [
              'Maksimal byggehøyde: 9 meter',
              'Minimum avstand til nabogrense: 4 meter',
              'Utnyttelsesgrad: 30%'
            ]
          });
        } else {
          setError('Eiendomsdata ikke funnet');
        }
        setLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [propertyId, initialData]);
  
  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-900 border border-white/10 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Laster eiendomsdetaljer...</p>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="w-full h-96 bg-gray-900 border border-white/10 rounded-xl flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block bg-red-900/20 p-4 rounded-full mb-4">
            <Info className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Kunne ikke laste eiendomsdata</h3>
          <p className="text-gray-400">{error || 'Det oppstod en feil'}</p>
        </div>
      </div>
    );
  }
  
  // Rendrer en forenklet 2D-visualisering av tomten
  const renderPlotView = () => (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <div 
        className="bg-green-900/30 border-2 border-green-500/50 rounded-lg relative"
        style={{ 
          width: '80%', 
          height: '80%',
          maxWidth: '500px',
          maxHeight: '400px'
        }}
      >
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs py-1 px-2 rounded">
          Tomt: {data.plotSize} m²
        </div>
        
        <div className="absolute bottom-2 right-2 flex items-center bg-black/60 text-white text-xs py-1 px-2 rounded">
          <Grid3X3 className="h-3 w-3 mr-1" />
          <span>Maks utnyttelse: {data.maxBuildableArea} m²</span>
        </div>
        
        {/* Representere byggemulighet */}
        <div 
          className="absolute bg-blue-500/30 border border-blue-500/70"
          style={{ 
            width: '60%', 
            height: '60%', 
            left: '20%', 
            top: '20%'
          }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm whitespace-nowrap">
            Mulig byggesone
          </div>
        </div>
      </div>
    </div>
  );
  
  // Rendrer en forenklet visning av byggemuligheter
  const renderBuildingView = () => (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Byggemuligheter</h3>
      
      <div className="space-y-6">
        {data.buildingOptions?.map((option, index) => (
          <div 
            key={index}
            className="bg-gray-800/70 border border-white/10 rounded-lg p-4"
          >
            <h4 className="text-lg font-medium text-white flex items-center mb-3">
              <Home className="h-5 w-5 mr-2 text-blue-400" />
              {option.type}
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-xs">Størrelse</p>
                <p className="text-white font-medium">{option.maxSize} m²</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-xs">Est. kostnad</p>
                <p className="text-white font-medium">{option.estimatedCost.toLocaleString()} kr</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-xs">Est. verdi</p>
                <p className="text-white font-medium">{option.estimatedValue.toLocaleString()} kr</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-xs">ROI</p>
                <p className="text-white font-medium">{option.roi}%</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-full" 
                style={{ width: `${Math.min(option.roi, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Rendrer reguleringsinformasjon
  const renderRestrictionsView = () => (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Reguleringsbestemmelser</h3>
      
      <div className="space-y-3">
        {data.zoneRestrictions?.map((restriction, index) => (
          <div 
            key={index}
            className="flex items-start py-2 border-b border-white/10"
          >
            <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-white">{restriction}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-300 text-sm">
          Merk: Dette er en forenklet visning av reguleringsbestemmelsene. For fullstendig informasjon, se kommunens reguleringsplan.
        </p>
      </div>
    </div>
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl overflow-hidden ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      <div className="bg-black/50 p-4 flex items-center justify-between">
        <h3 className="text-white font-medium">Eiendomsvisualiser: {data.address}</h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 bg-black/30 hover:bg-black/60 rounded-full text-white transition-colors"
          >
            {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
          
          <button
            onClick={() => {
              // Rotering ville kreve faktisk 3D-visning
              alert('3D-rotering vil bli implementert med Three.js');
            }}
            className="p-2 bg-black/30 hover:bg-black/60 rounded-full text-white transition-colors"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveView('plot')}
          className={`px-4 py-2 text-sm flex-1 ${
            activeView === 'plot' 
              ? 'bg-blue-900/50 text-blue-300 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          Tomt
        </button>
        <button
          onClick={() => setActiveView('building')}
          className={`px-4 py-2 text-sm flex-1 ${
            activeView === 'building' 
              ? 'bg-blue-900/50 text-blue-300 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          Byggemuligheter
        </button>
        <button
          onClick={() => setActiveView('restrictions')}
          className={`px-4 py-2 text-sm flex-1 ${
            activeView === 'restrictions' 
              ? 'bg-blue-900/50 text-blue-300 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:bg-white/5'
          }`}
        >
          Regulering
        </button>
      </div>
      
      <div className="h-96">
        {activeView === 'plot' && renderPlotView()}
        {activeView === 'building' && renderBuildingView()}
        {activeView === 'restrictions' && renderRestrictionsView()}
      </div>
      
      <div className="px-4 py-3 bg-black/30 text-center">
        <p className="text-sm text-gray-400">
          * Dette er en forenklet visualisering. For fotorealistisk 3D-modell, bestill en detaljert analyse.
        </p>
      </div>
    </motion.div>
  );
} 