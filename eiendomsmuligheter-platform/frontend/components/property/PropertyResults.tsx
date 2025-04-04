"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Download,
  Bookmark,
  BarChart4,
  Box,
  FileText,
  Home,
  Zap,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Model3DShowcase } from '../showcase/Model3DShowcase';

// Property data interface
interface PropertyData {
  id: string;
  address: string;
  thumbnailUrl: string;
  potentialScore: number;
  currentArea: number;
  potentialArea: number;
  currentValue: number;
  potentialValue: number;
  zoning: ZoningData;
  models: Model3D[];
  financials: FinancialData;
  energy: EnergyData;
  documents: Document[];
}

interface ZoningData {
  currentUse: string;
  potentialUse: string;
  buildingLines: any[]; // Simplified for now
  restrictions: string[];
  allowedAreas: any[]; // Simplified for now
  forbiddenAreas: any[]; // Simplified for now
}

interface Model3D {
  id: string;
  name: string;
  thumbnailUrl: string;
  modelUrl: string;
  description: string;
  type?: 'model'; // For Model3DShowcase compatibility
}

interface FinancialData {
  developmentCosts: number;
  estimatedReturn: number;
  roi: number;
  scenarios: FinancialScenario[];
  monthlyData: MonthlyFinancialData[];
}

interface FinancialScenario {
  name: string;
  description: string;
  cost: number;
  return: number;
  roi: number;
}

interface MonthlyFinancialData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

interface EnergyData {
  currentRating: string;
  potentialRating: string;
  currentConsumption: number;
  potentialConsumption: number;
  upgradeCost: number;
  savingsPerYear: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl: string;
  status: "ready" | "processing" | "failed";
}

// Tabs enum for type safety
enum Tab {
  Overview = "overview",
  Models = "models",
  Zoning = "zoning",
  Financial = "financial",
  Energy = "energy",
  Documents = "documents",
}

// Memoized tab button component for performance
const TabButton = ({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: JSX.Element; 
  label: string;
}): JSX.Element => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center py-2 px-3 md:px-4 rounded-lg transition-all duration-300
        ${active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
          : "text-blue-100 hover:bg-white hover:bg-opacity-10"}
      `}
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${label.toLowerCase()}`}
    >
      <span className="mr-2" aria-hidden="true">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};
TabButton.displayName = 'TabButton'; // Nødvendig for React DevTools

// Memoized Image component with error handling
const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  fallbackSrc = '/images/placeholder.jpg'
}: { 
  src: string, 
  alt: string, 
  className?: string,
  fallbackSrc?: string
}): JSX.Element => {
  const [imgSrc, setImgSrc] = useState(src);
  
  const handleError = () => {
    setImgSrc(fallbackSrc);
  };
  
  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className || "w-full h-full object-cover"} 
      onError={handleError}
      loading="lazy"
    />
  );
};
OptimizedImage.displayName = 'OptimizedImage';

// The main component
const PropertyResults = ({ propertyId }: { propertyId: string }): JSX.Element => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Overview);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyData | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Fetch property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        // This would be replaced with an actual API call
        // const response = await fetch(`/api/properties/${propertyId}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        setTimeout(() => {
          const mockData: PropertyData = {
            id: propertyId,
            address: "Solbergveien 47, 3057 Solbergmoen",
            thumbnailUrl: "/images/property-example.jpg",
            potentialScore: 78,
            currentArea: 150,
            potentialArea: 280,
            currentValue: 5200000,
            potentialValue: 8700000,
            zoning: {
              currentUse: "Bolig",
              potentialUse: "Bolig med sekundærenhet",
              buildingLines: [],
              restrictions: ["Høydebegrensning: 8m", "Maks fotavtrykk: 30%"],
              allowedAreas: [],
              forbiddenAreas: []
            },
            models: [
              {
                id: "model1",
                name: "Nåværende bygning",
                thumbnailUrl: "/images/model-current-thumbnail.jpg",
                modelUrl: "/models/current.glb",
                description: "Eksisterende tilstand",
                type: "model"
              },
              {
                id: "model2",
                name: "Utbyggingsmulighet",
                thumbnailUrl: "/images/model-extension-thumbnail.jpg",
                modelUrl: "/models/extension.glb",
                description: "Potensiell utvidelse med 2 nye soverom",
                type: "model"
              },
              {
                id: "model3",
                name: "Sekundærenhet",
                thumbnailUrl: "/images/model-secondary-thumbnail.jpg",
                modelUrl: "/models/secondary.glb",
                description: "Tilleggsbygg for utleie",
                type: "model"
              }
            ],
            financials: {
              developmentCosts: 2500000,
              estimatedReturn: 3500000,
              roi: 140,
              scenarios: [
                {
                  name: "Enkel renovering",
                  description: "Kun innvendig oppussing",
                  cost: 800000,
                  return: 1200000,
                  roi: 150
                },
                {
                  name: "Full utbygging",
                  description: "Tillegg av two rom og bad",
                  cost: 1500000,
                  return: 2300000,
                  roi: 153
                },
                {
                  name: "Sekundærenhet",
                  description: "Bygging av separat utleiedel",
                  cost: 2500000,
                  return: 3500000,
                  roi: 140
                }
              ],
              monthlyData: [
                { month: "Jan", income: 0, expenses: 25000, profit: -25000 },
                { month: "Feb", income: 0, expenses: 350000, profit: -350000 },
                { month: "Mar", income: 0, expenses: 450000, profit: -450000 },
                { month: "Apr", income: 0, expenses: 350000, profit: -350000 },
                { month: "Mai", income: 0, expenses: 250000, profit: -250000 },
                { month: "Jun", income: 15000, expenses: 150000, profit: -135000 },
                { month: "Jul", income: 15000, expenses: 100000, profit: -85000 },
                { month: "Aug", income: 15000, expenses: 50000, profit: -35000 },
                { month: "Sep", income: 15000, expenses: 10000, profit: 5000 },
                { month: "Okt", income: 15000, expenses: 10000, profit: 5000 },
                { month: "Nov", income: 15000, expenses: 10000, profit: 5000 },
                { month: "Des", income: 15000, expenses: 10000, profit: 5000 }
              ]
            },
            energy: {
              currentRating: "E",
              potentialRating: "B",
              currentConsumption: 250,
              potentialConsumption: 120,
              upgradeCost: 350000,
              savingsPerYear: 15000
            },
            documents: [
              {
                id: "doc1",
                name: "Byggesøknad",
                type: "PDF",
                url: "/documents/building-application.pdf",
                thumbnailUrl: "/images/document-building-thumbnail.jpg",
                status: "ready"
              },
              {
                id: "doc2",
                name: "Nabovarsel",
                type: "PDF",
                url: "/documents/neighbor-notification.pdf",
                thumbnailUrl: "/images/document-neighbor-thumbnail.jpg",
                status: "ready"
              },
              {
                id: "doc3",
                name: "Energiattest",
                type: "PDF",
                url: "/documents/energy-certificate.pdf",
                thumbnailUrl: "/images/document-energy-thumbnail.jpg",
                status: "processing"
              }
            ]
          };
          
          setProperty(mockData);
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError("Kunne ikke laste eiendomsdata. Vennligst prøv igjen.");
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyId]);

  // Memoized utility functions
  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(value);
  }, []);

  const formatPercentage = useCallback((value: number): string => {
    return `${value.toFixed(1)}%`;
  }, []);

  // Helper for ring animation
  const calculateRingPercentage = useCallback((score: number): number => {
    return (score / 100) * 283; // 283 is the circumference of a circle with r=45
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="w-24 h-24 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin" aria-hidden="true"></div>
        <p className="mt-6 text-white text-xl" role="status" aria-live="polite">Analyserer eiendom...</p>
      </div>
    );
  }

  // Render error state
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl max-w-md" role="alert" aria-live="assertive">
          <h2 className="text-2xl font-bold text-white mb-4">Kunne ikke laste eiendomsdata</h2>
          <p className="text-white">{error || "Ukjent feil oppstod. Vennligst prøv igjen senere."}</p>
          <button 
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={() => window.location.reload()}
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  // Render hero section
  const renderHeroSection = (): JSX.Element => {
    return (
      <div className="relative mb-8 overflow-hidden rounded-2xl h-64 md:h-96">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 z-0">
          <OptimizedImage 
            src={property.thumbnailUrl} 
            alt={`Eiendom: ${property.address}`} 
            className="w-full h-full object-cover"
            fallbackSrc="/images/property-placeholder.jpg"
          />
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{property.address}</h1>
              <p className="text-blue-200 mt-2">Gnr/Bnr: 45/76 • 980 m² tomt</p>
            </div>
            
            {/* Potential score */}
            <div className="mt-4 md:mt-0">
              <div className="rounded-lg bg-black/30 backdrop-blur-sm p-3 inline-block">
                <p className="text-sm text-blue-200 mb-1">Potensial-score</p>
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#0f172a" 
                      strokeWidth="10" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - calculateRingPercentage(property.potentialScore)}
                      strokeLinecap="round"
                      className="transform -rotate-90 origin-center"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{property.potentialScore}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <button 
              className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg flex items-center text-white transition-colors"
              aria-label="Del analyse"
            >
              <Share2 size={16} className="mr-2" aria-hidden="true" />
              Del
            </button>
            <button 
              className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg flex items-center text-white transition-colors"
              aria-label="Last ned rapport"
            >
              <Download size={16} className="mr-2" aria-hidden="true" />
              Last ned rapport
            </button>
            <button 
              className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg flex items-center text-white transition-colors"
              aria-label="Lagre analyse"
            >
              <Bookmark size={16} className="mr-2" aria-hidden="true" />
              Lagre
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render tabs
  const renderTabs = (): JSX.Element => {
    return (
      <div className="flex flex-wrap gap-1 md:gap-2 p-1 mb-6 rounded-lg bg-white bg-opacity-10 backdrop-blur-md" role="tablist">
        <TabButton 
          active={activeTab === Tab.Overview} 
          onClick={() => setActiveTab(Tab.Overview)}
          icon={<Home size={18} />}
          label="Oversikt"
        />
        <TabButton 
          active={activeTab === Tab.Models} 
          onClick={() => setActiveTab(Tab.Models)}
          icon={<Box size={18} />}
          label="3D-modeller"
        />
        <TabButton 
          active={activeTab === Tab.Zoning} 
          onClick={() => setActiveTab(Tab.Zoning)}
          icon={<FileText size={18} />}
          label="Regulering"
        />
        <TabButton 
          active={activeTab === Tab.Financial} 
          onClick={() => setActiveTab(Tab.Financial)}
          icon={<BarChart4 size={18} />}
          label="Finansiell"
        />
        <TabButton 
          active={activeTab === Tab.Energy} 
          onClick={() => setActiveTab(Tab.Energy)}
          icon={<Zap size={18} />}
          label="Energi"
        />
        <TabButton 
          active={activeTab === Tab.Documents} 
          onClick={() => setActiveTab(Tab.Documents)}
          icon={<FileCheck size={18} />}
          label="Dokumenter"
        />
      </div>
    );
  };

  // Render tab content
  const renderTabContent = (): JSX.Element => {
    switch (activeTab) {
      case Tab.Overview:
        return (
          <div role="tabpanel" id="panel-oversikt" aria-labelledby="tab-oversikt">
            {renderOverviewTab()}
          </div>
        );
      case Tab.Models:
        return (
          <div role="tabpanel" id="panel-3d-modeller" aria-labelledby="tab-3d-modeller">
            {renderModelsTab()}
          </div>
        );
      case Tab.Zoning:
        return (
          <div role="tabpanel" id="panel-regulering" aria-labelledby="tab-regulering">
            {renderZoningTab()}
          </div>
        );
      case Tab.Financial:
        return (
          <div role="tabpanel" id="panel-finansiell" aria-labelledby="tab-finansiell">
            {renderFinancialTab()}
          </div>
        );
      case Tab.Energy:
        return (
          <div role="tabpanel" id="panel-energi" aria-labelledby="tab-energi">
            {renderEnergyTab()}
          </div>
        );
      case Tab.Documents:
        return (
          <div role="tabpanel" id="panel-dokumenter" aria-labelledby="tab-dokumenter">
            {renderDocumentsTab()}
          </div>
        );
      default:
        return (
          <div role="tabpanel" id="panel-oversikt" aria-labelledby="tab-oversikt">
            {renderOverviewTab()}
          </div>
        );
    }
  };

  // Overview tab content
  const renderOverviewTab = (): JSX.Element => {
    // Memoize calculations
    const valueDifference = useMemo(() => property.potentialValue - property.currentValue, [property]);
    const valueDifferencePercentage = useMemo(() => (valueDifference / property.currentValue) * 100, [valueDifference, property]);
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Key Metrics */}
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Nøkkeltall</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Nåværende areal</span>
              <span className="text-white font-medium">{property.currentArea} m²</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Potensielt areal</span>
              <span className="text-white font-medium">{property.potentialArea} m²</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Estimert nåverdi</span>
              <span className="text-white font-medium">{formatCurrency(property.currentValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Potensiell verdi</span>
              <span className="text-white font-medium">{formatCurrency(property.potentialValue)}</span>
            </div>
            <div className="flex justify-between items-center font-semibold text-lg pt-2 border-t border-white border-opacity-10">
              <span className="text-blue-100">Verdiøkning</span>
              <span className="text-green-400">{formatCurrency(valueDifference)} ({valueDifferencePercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </motion.div>
        
        {/* Value Comparison */}
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Verdiutvikling</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Nåværende', value: property.currentValue },
                  { name: 'Potensiell', value: property.potentialValue }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis 
                  stroke="#94a3b8"
                  tickFormatter={(value) => `${Math.round(value / 1000000)} M`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), "Verdi"]}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white'
                  }}
                />
                <Area 
                  type="monotone"
                  dataKey="value"
                  fill="url(#colorValue)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Before & After Preview */}
        <motion.div variants={itemVariants} className="glass-panel p-6 md:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-4">Før & Etter Visualisering</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-lg h-64 bg-slate-800">
              <OptimizedImage 
                src={property.models[0]?.thumbnailUrl || "/images/current-building-placeholder.jpg"} 
                alt="Nåværende bygg"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-white text-lg">Nåværende Bygg</span>
              </div>
              <div className="absolute bottom-0 left-0 p-2 bg-black bg-opacity-60 rounded-tr-lg">
                <span className="text-white text-sm">{property.currentArea} m²</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg h-64 bg-slate-800">
              <OptimizedImage 
                src={property.models[2]?.thumbnailUrl || "/images/secondary-unit-placeholder.jpg"}
                alt="Potensiell sekundærenhet"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-white text-lg">Potensiell</span>
              </div>
              <div className="absolute bottom-0 left-0 p-2 bg-black bg-opacity-60 rounded-tr-lg">
                <span className="text-white text-sm">{property.potentialArea} m²</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Recommendations */}
        <motion.div variants={itemVariants} className="glass-panel p-6 md:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-4">Anbefalinger</h3>
          <div className="space-y-4">
            <div className="flex p-4 rounded-lg bg-blue-600 bg-opacity-20 border border-blue-500 border-opacity-30">
              <div className="mr-4 mt-1">
                <Info size={24} className="text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-medium text-white">Utbygging av sekundærenhet</h4>
                <p className="text-blue-100 mt-1">
                  Basert på vår analyse, anbefaler vi å bygge en selvstendig utleieenhet. Dette gir høyest ROI og reduserer nedbetaling av investeringskostnadene gjennom månedlige leieinntekter.
                </p>
              </div>
            </div>
            
            <div className="flex p-4 rounded-lg bg-purple-600 bg-opacity-20 border border-purple-500 border-opacity-30">
              <div className="mr-4 mt-1">
                <Info size={24} className="text-purple-400" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-medium text-white">Energitiltak</h4>
                <p className="text-blue-100 mt-1">
                  Oppgradering fra energimerke E til B vil gi betydelige månedlige besparelser og øke eiendommens verdi. Estimert tilbakebetalingstid er 23 år, men med statlige støtteordninger kan dette reduseres til 15-18 år.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // 3D Models tab content
  const renderModelsTab = (): JSX.Element => {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">3D-modellvisning</h3>
          <Model3DShowcase className="h-96 rounded-lg overflow-hidden" />
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            {property.models.map((model) => (
              <div 
                key={model.id}
                className="p-2 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 cursor-pointer transition-all border border-white border-opacity-10 hover:border-opacity-20"
              >
                <div className="bg-slate-800 rounded-lg h-32 mb-2 overflow-hidden">
                  <OptimizedImage 
                    src={model.thumbnailUrl} 
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-white text-sm font-medium">{model.name}</h4>
                <p className="text-blue-100 text-xs mt-1">{model.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Sammenligning</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-lg h-64 bg-slate-800">
              <OptimizedImage 
                src={property.models[0]?.thumbnailUrl || "/images/current-building-placeholder.jpg"}
                alt="Nåværende bygning"
              />
              <div className="absolute bottom-0 left-0 p-2 bg-black bg-opacity-60 rounded-tr-lg">
                <span className="text-white text-sm">Nåværende</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg h-64 bg-slate-800">
              <OptimizedImage 
                src={property.models[2]?.thumbnailUrl || "/images/secondary-unit-placeholder.jpg"}
                alt="Potensiell sekundærenhet"
              />
              <div className="absolute bottom-0 left-0 p-2 bg-black bg-opacity-60 rounded-tr-lg">
                <span className="text-white text-sm">Potensiell</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-1/2"></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-blue-100">Nåværende</span>
              <span className="text-xs text-blue-100">Potensiell</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Zoning tab content
  const renderZoningTab = (): JSX.Element => {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Reguleringsplan</h3>
          <div className="bg-slate-800 rounded-lg h-96 flex items-center justify-center">
            <p className="text-white opacity-60">Reguleringsplankart lastes her</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Reguleringsinformasjon</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white divide-opacity-10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-100">Parameter</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-100">Nåværende</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-100">Tillatt</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-100">Utnyttelsespotensial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white divide-opacity-10">
                <tr>
                  <td className="px-4 py-3 text-sm text-white">Bruksformål</td>
                  <td className="px-4 py-3 text-sm text-white">{property.zoning.currentUse}</td>
                  <td className="px-4 py-3 text-sm text-white">{property.zoning.potentialUse}</td>
                  <td className="px-4 py-3 text-sm text-green-400">Sekundærbolig mulig</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-white">Byggehøyde</td>
                  <td className="px-4 py-3 text-sm text-white">6.5m</td>
                  <td className="px-4 py-3 text-sm text-white">8m</td>
                  <td className="px-4 py-3 text-sm text-green-400">+1.5m (ekstra etasje)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-white">Utnyttingsgrad</td>
                  <td className="px-4 py-3 text-sm text-white">15%</td>
                  <td className="px-4 py-3 text-sm text-white">30%</td>
                  <td className="px-4 py-3 text-sm text-green-400">+15% (130m²)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-white">Avstand til nabogrense</td>
                  <td className="px-4 py-3 text-sm text-white">5m</td>
                  <td className="px-4 py-3 text-sm text-white">4m</td>
                  <td className="px-4 py-3 text-sm text-yellow-400">OK med dispensasjon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Byggelinjer og Begrensninger</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-slate-800 rounded-lg h-64 mb-3 flex items-center justify-center">
                <p className="text-white opacity-60">Byggelinjer visualisering</p>
              </div>
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-white">Byggelinje</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-white">Forbudt sone</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-white">Tillatt område</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Begrensninger og Bestemmelser</h4>
              <ul className="space-y-2">
                {property.zoning.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight size={16} className="text-blue-400 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-white text-sm">{restriction}</span>
                  </li>
                ))}
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-blue-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white text-sm">Maksimal tomteutnyttelse: 30%</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-blue-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white text-sm">Minimum parkering: 2 plasser</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-blue-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white text-sm">Tillatt å bygge sekundærbolig inntil 70m²</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Financial tab content
  const renderFinancialTab = (): JSX.Element => {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Finansiell Oversikt</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
              <p className="text-blue-100 text-sm">Investeringskostnad</p>
              <p className="text-white text-2xl font-bold mt-1">{formatCurrency(property.financials.developmentCosts)}</p>
            </div>
            <div className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
              <p className="text-blue-100 text-sm">Estimert avkastning</p>
              <p className="text-white text-2xl font-bold mt-1">{formatCurrency(property.financials.estimatedReturn)}</p>
            </div>
            <div className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
              <p className="text-blue-100 text-sm">ROI</p>
              <p className="text-green-400 text-2xl font-bold mt-1">{formatPercentage(property.financials.roi)}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Månedlig Cash Flow</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={property.financials.monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), ""]}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white'
                  }}
                />
                <Line type="monotone" dataKey="income" name="Inntekt" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" name="Utgift" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" name="Resultat" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Utbyggingsalternativer</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white divide-opacity-10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-100">Alternativ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-100">Beskrivelse</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-100">Kostnad</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-100">Avkastning</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-100">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white divide-opacity-10">
                {property.financials.scenarios.map((scenario, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-white font-medium">{scenario.name}</td>
                    <td className="px-4 py-3 text-sm text-white">{scenario.description}</td>
                    <td className="px-4 py-3 text-sm text-white">{formatCurrency(scenario.cost)}</td>
                    <td className="px-4 py-3 text-sm text-white">{formatCurrency(scenario.return)}</td>
                    <td className="px-4 py-3 text-sm text-green-400">{formatPercentage(scenario.roi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Energy tab content
  const renderEnergyTab = (): JSX.Element => {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Energimerke</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <h4 className="text-center text-blue-100 mb-2">Nåværende</h4>
                <div className="w-60 h-60 relative">
                  <div className="w-full h-full rounded-full bg-white bg-opacity-5 border border-white border-opacity-10 flex items-center justify-center">
                    <span className="text-8xl font-bold text-red-500">{property.energy.currentRating}</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-white">
                <span className="font-semibold">{property.energy.currentConsumption} kWh/m²</span> årlig forbruk
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <h4 className="text-center text-blue-100 mb-2">Potensial</h4>
                <div className="w-60 h-60 relative">
                  <div className="w-full h-full rounded-full bg-white bg-opacity-5 border border-white border-opacity-10 flex items-center justify-center">
                    <span className="text-8xl font-bold text-green-500">{property.energy.potentialRating}</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-white">
                <span className="font-semibold">{property.energy.potentialConsumption} kWh/m²</span> årlig forbruk
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Kostnadsberegning</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
              <p className="text-blue-100 text-sm">Oppgraderingskostnad</p>
              <p className="text-white text-2xl font-bold mt-1">{formatCurrency(property.energy.upgradeCost)}</p>
            </div>
            <div className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
              <p className="text-blue-100 text-sm">Årlig besparelse</p>
              <p className="text-white text-2xl font-bold mt-1">{formatCurrency(property.energy.savingsPerYear)}</p>
            </div>
            <div className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
              <p className="text-blue-100 text-sm">Tilbakebetalingstid</p>
              <p className="text-white text-2xl font-bold mt-1">{Math.round(property.energy.upgradeCost / property.energy.savingsPerYear)} år</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Anbefalte Tiltak</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10 flex">
              <div className="mr-6 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-600 bg-opacity-20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-400">1</span>
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium">Etterisolering av tak og vegger</h4>
                <p className="text-blue-100 mt-1">Etterisolering med ekstra 15cm isolasjon i tak og 10cm i vegger kan redusere varmetapet betydelig.</p>
                <div className="mt-2 flex justify-between">
                  <span className="text-blue-100 text-sm">Estimert kostnad: {formatCurrency(150000)}</span>
                  <span className="text-green-400 text-sm">Årlig besparelse: {formatCurrency(7500)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10 flex">
              <div className="mr-6 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-600 bg-opacity-20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-400">2</span>
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium">Installasjon av varmepumpe</h4>
                <p className="text-blue-100 mt-1">Luft-til-luft varmepumpe kan redusere energiforbruket til oppvarming med 40-60%.</p>
                <div className="mt-2 flex justify-between">
                  <span className="text-blue-100 text-sm">Estimert kostnad: {formatCurrency(25000)}</span>
                  <span className="text-green-400 text-sm">Årlig besparelse: {formatCurrency(5000)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10 flex">
              <div className="mr-6 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-600 bg-opacity-20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-400">3</span>
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium">Utskifting av vinduer</h4>
                <p className="text-blue-100 mt-1">Bytte til 3-lags energieffektive vinduer kan redusere varmetapet gjennom vinduene med 50%.</p>
                <div className="mt-2 flex justify-between">
                  <span className="text-blue-100 text-sm">Estimert kostnad: {formatCurrency(120000)}</span>
                  <span className="text-green-400 text-sm">Årlig besparelse: {formatCurrency(4500)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Documents tab content
  const renderDocumentsTab = (): JSX.Element => {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Genererte Dokumenter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {property.documents.map((doc) => (
              <div 
                key={doc.id}
                className="p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10 hover:bg-opacity-10 transition-all"
              >
                <div className="aspect-[4/3] bg-slate-800 rounded-lg mb-3 relative overflow-hidden">
                  {/* Placeholder for document thumbnail */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText size={48} className="text-white opacity-30" />
                  </div>
                  
                  {/* Status indicator */}
                  <div className={`
                    absolute bottom-2 right-2 px-2 py-1 rounded-md text-xs font-medium
                    ${doc.status === 'ready' ? 'bg-green-500 text-white' : 
                      doc.status === 'processing' ? 'bg-yellow-500 text-white' : 
                      'bg-red-500 text-white'}
                  `}>
                    {doc.status === 'ready' ? 'Klar' : 
                     doc.status === 'processing' ? 'Behandler...' : 
                     'Feilet'}
                  </div>
                </div>
                
                <h4 className="text-white font-medium">{doc.name}</h4>
                <p className="text-blue-100 text-sm mt-1">{doc.type} Dokument</p>
                
                <div className="mt-3 flex justify-between items-center">
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center
                      ${doc.status === 'ready' ? 
                        'bg-blue-600 hover:bg-blue-700 text-white' : 
                        'bg-slate-700 text-slate-400 cursor-not-allowed'}
                    `}
                    disabled={doc.status !== 'ready'}
                  >
                    <Download size={14} className="mr-1.5" />
                    Last ned
                  </button>
                  
                  <button className="p-1.5 rounded-full hover:bg-white hover:bg-opacity-10">
                    <Info size={16} className="text-blue-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Last opp egne dokumenter</h3>
          <div className="border-2 border-dashed border-white border-opacity-20 rounded-lg p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-600 bg-opacity-20 flex items-center justify-center mb-4">
              <Download size={28} className="text-blue-400" />
            </div>
            <p className="text-white font-medium">Dra og slipp filer her</p>
            <p className="text-blue-100 text-sm mt-1 text-center">eller</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
              Velg filer
            </button>
            <p className="text-blue-100 text-xs mt-4 text-center max-w-md">
              Støttede formater: PDF, JPG, PNG, DOC, DOCX (maks 20MB)
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        {renderHeroSection()}
        
        {/* Tabs */}
        {renderTabs()}
        
        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

// Add CSS for glassmorphism
const styles = `
  .glass-panel {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36);
  }
`;

// Add the styles to the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export default PropertyResults;