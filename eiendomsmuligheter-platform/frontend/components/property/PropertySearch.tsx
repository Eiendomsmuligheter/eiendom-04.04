"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { propertyService } from '../../services/api';
import { Search, Loader, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PropertySearchResult {
  id: string;
  address: string;
  municipality: string;
  plotSize: number;
  coordinates?: {
    lat: number;
    lng: number;
  }
}

export function PropertySearch() {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<PropertySearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Vennligst skriv inn en adresse');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    setSuccess(false);
    setSearchResult(null);
    
    try {
      const result = await propertyService.search(address);
      setSearchResult(result);
      setSuccess(true);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Kunne ikke søke etter eiendommen');
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8 mb-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Finn eiendommens potensial</h2>
        
        <form onSubmit={handleSearch}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Skriv inn adresse (f.eks. Solbergveien 47, 3057 Solbergmoen)"
              className="block w-full pl-10 pr-20 py-4 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="submit"
                disabled={isSearching || !address.trim()}
                className={`h-full px-4 rounded-r-lg flex items-center justify-center ${
                  isSearching || !address.trim()
                    ? 'bg-blue-800/50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSearching ? (
                  <Loader className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 text-white mr-2" />
                    <span className="text-white">Søk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {searchResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8"
        >
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-xl font-semibold text-white">Eiendom funnet</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Eiendomsinformasjon</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Adresse</p>
                  <p className="text-white font-medium">{searchResult.address}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Kommune</p>
                  <p className="text-white font-medium">{searchResult.municipality}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Tomtestørrelse</p>
                  <p className="text-white font-medium">{searchResult.plotSize} m²</p>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href={`/property/${searchResult.id}`}>
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center"
                  >
                    <span>Se full analyse</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
            
            <div>
              {searchResult.coordinates ? (
                <div className="w-full h-64 bg-gray-800 rounded-lg overflow-hidden relative">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${searchResult.coordinates.lat},${searchResult.coordinates.lng}&zoom=17`}
                    allowFullScreen
                  ></iframe>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-white text-center px-4">Kartvisning kommer snart</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Kartdata ikke tilgjengelig</p>
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-sm text-gray-400">
                  * Vil du undersøke eiendommens potensial? Få en detaljert analyse med 3D-visualisering av byggemuligheter.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 