"use client";

import React from 'react';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize, Minimize, FileText, BarChart, Box } from 'lucide-react';

interface ModelImage {
  id: number;
  src: string;
  alt: string;
  type: 'model' | 'document' | 'energy';
  description: string;
}

interface Model3DShowcaseProps {
  className?: string;
}

export const Model3DShowcase = ({ className = '' }: Model3DShowcaseProps): JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedType, setSelectedType] = useState<'model' | 'document' | 'energy' | 'all'>('all');

  // Dummy images - in real application these would come from API
  const modelImages: ModelImage[] = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      alt: '3D-modell av enebolig',
      type: 'model',
      description: 'Fotorealistisk 3D-modell av eksisterende enebolig med ny utbygging visualisert'
    },
    {
      id: 2, 
      src: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      alt: '3D-modell av leilighetsbygg',
      type: 'model',
      description: 'Detaljert 3D-modell av planlagt leilighetsbygg med nye balkonger'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      alt: '3D landskapsmodell',
      type: 'model',
      description: 'Terreng- og landskapsanalyse med høydeprofiler'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1626164555858-adf2e95c2756?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      alt: 'Kommunale skjemaer',
      type: 'document',
      description: 'Ferdig utfylt byggesøknad for utbygging av enebolig'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1664575599618-8f6bd76fc670?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      alt: 'Reguleringsplankart',
      type: 'document',
      description: 'Automatisk utfylt nabovarsel med vedlegg'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      alt: 'Dispensasjonssøknad',
      type: 'document',
      description: 'Ferdig utfylt dispensasjonssøknad med AI-generert begrunnelse'
    },
    {
      id: 7,
      src: 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      alt: 'Energiberegning',
      type: 'energy',
      description: 'Detaljert energiberegning for eksisterende og ny bolig'
    },
    {
      id: 8,
      src: 'https://images.unsplash.com/photo-1590247513027-39d74b4e3743?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      alt: 'Solcelleberegning',
      type: 'energy',
      description: 'Analyse av solcelle-potensial med kostnads- og inntjeningsberegning'
    },
    {
      id: 9,
      src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      alt: 'Energimerking',
      type: 'energy',
      description: 'Simulering av energimerke før og etter oppgradering'
    }
  ];

  const filteredImages = selectedType === 'all' 
    ? modelImages 
    : modelImages.filter(img => img.type === selectedType);

  const currentImage = filteredImages[currentIndex];

  const nextImage = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % filteredImages.length);
  }, [filteredImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + filteredImages.length) % filteredImages.length);
  }, [filteredImages.length]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getTypeLabel = (type: 'model' | 'document' | 'energy' | 'all'): string => {
    switch (type) {
      case 'model': return '3D-modeller';
      case 'document': return 'Dokumenter';
      case 'energy': return 'Energiberegning';
      case 'all': return 'Alle eksempler';
    }
  };

  const getTypeIcon = (type: 'model' | 'document' | 'energy' | 'all') => {
    switch (type) {
      case 'model': return <Box className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'energy': return <BarChart className="h-5 w-5" />;
      case 'all': return null;
    }
  };

  return (
    <div className={`py-20 ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center' : ''}`}>
      <div className={`${isFullscreen ? 'w-full h-full p-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Eksempler på leveranser</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Se eksempler på 3D-modeller, ferdig utfylte skjemaer og energiberegninger som inngår i våre analyser.
          </p>
        </div>
        
        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(['all', 'model', 'document', 'energy'] as const).map(type => (
            <motion.button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setCurrentIndex(0);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                selectedType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70'
              }`}
            >
              {getTypeIcon(type)}
              {getTypeLabel(type)}
            </motion.button>
          ))}
        </div>
        
        {/* Main display */}
        <div className={`relative overflow-hidden rounded-xl border border-white/10 ${
          isFullscreen ? 'h-3/4' : 'aspect-[16/9]'
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full bg-gray-900"
            >
              <img 
                src={currentImage?.src} 
                alt={currentImage?.alt} 
                className="w-full h-full object-cover" 
              />
              
              {/* Caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-500/20 text-blue-300 mb-2 inline-block">
                      {getTypeLabel(currentImage?.type as any)}
                    </span>
                    <h3 className="text-lg font-medium text-white">
                      {currentImage?.alt}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {currentImage?.description}
                    </p>
                  </div>
                  <button 
                    onClick={toggleFullscreen}
                    className="bg-black/50 p-2 rounded-full text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation arrows */}
          <button 
            onClick={prevImage}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-white/20"
            aria-label="Forrige bilde"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-white/20"
            aria-label="Neste bilde"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        {/* Thumbnails */}
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
          {filteredImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative rounded-lg overflow-hidden aspect-square ${
                index === currentIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={image.src} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/showcase">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white font-medium"
            >
              Se flere eksempler
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Fikse typen for Link
interface LinkProps {
  href: string;
  children: React.ReactNode;
}

const Link = ({ href, children }: LinkProps): JSX.Element => {
  return (
    <a href={href} className="inline-block">
      {children}
    </a>
  );
};