"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface UrlPropertySearchProps {
  onSearch?: (url: string) => void;
  className?: string;
}

export const UrlPropertySearch = ({ 
  onSearch, 
  className = '' 
}: UrlPropertySearchProps): JSX.Element => {
  const [url, setUrl] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) return;
    
    setIsSearching(true);
    
    try {
      // Simulate API call for demo purposes - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSearch) {
        onSearch(url);
      }
      
      // For demo, we'll just redirect to a placeholder page
      // In real app, you'd submit to backend and handle the response
      // window.location.href = `/property/analysis?url=${encodeURIComponent(url)}`;
    } catch (error) {
      console.error('Error analyzing property from URL:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const isValidUrl = () => {
    return url.includes('finn.no') || 
           url.includes('hybel.no') || 
           url.includes('eiendomsmegler1.no') || 
           url.includes('dnbeiendom.no');
  };

  // Fix for fragment errors
  const LoadingContent = (): JSX.Element => (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Analyserer bolig...</span>
    </>
  );

  const SearchContent = (): JSX.Element => (
    <>
      <Search className="h-5 w-5" />
      <span>Analyser eiendom fra annonse</span>
    </>
  );

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Analyse fra boligannonse</h3>
        <button 
          className="text-blue-400 hover:text-blue-300 transition-colors"
          onClick={() => setShowInfo(!showInfo)}
        >
          <Info className="h-5 w-5" />
        </button>
      </div>
      
      {showInfo && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg text-sm text-gray-300"
        >
          <p>Lim inn en lenke fra en boligannonse fra finn.no eller andre norske boligportaler. 
          Vi vil automatisk hente all relevant informasjon og analysere eiendommens potensial.</p>
        </motion.div>
      )}
      
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ExternalLink className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Lim inn URL fra finn.no eller annen boligportal"
            className="block w-full pl-10 pr-4 py-3 border border-white/10 rounded-lg bg-black/60 backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={!url || isSearching}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all ${
              url && !isSearching
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-700/50 cursor-not-allowed'
            }`}
          >
            {isSearching ? <LoadingContent /> : <SearchContent />}
          </button>
          
          <div className="text-center">
            <span className="text-gray-500 text-sm">eller</span>
          </div>
          
          <Link href="/property/search">
            <button
              type="button"
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white font-medium transition-colors"
            >
              Søk med adresse
            </button>
          </Link>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Støttede portaler: finn.no, hybel.no, eiendomsmegler1.no, dnbeiendom.no og flere.</p>
      </div>
    </div>
  );
}; 