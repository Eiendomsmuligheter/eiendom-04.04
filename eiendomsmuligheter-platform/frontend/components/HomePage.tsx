"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Check, ArrowRight, Building, Home, Shield, 
  Search, Zap, MapPin, Database, FileText, ChevronRight 
} from 'lucide-react';

import { Model3DShowcase } from './showcase/Model3DShowcase';
import { Footer } from './layout/Footer';
import { UrlPropertySearch } from './property/UrlPropertySearch';

export const HomePage = () => {
  const [searchType, setSearchType] = useState<'address' | 'url'>('address');

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen">
      {/* Hero-seksjon */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Transformér din eiendom:</span> Se det usynlige potensiale AI avdekker
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300 mb-8"
            >
              Få profesjonelle eiendomsanalyser med fotorealistiske 3D-modeller og reguleringsplansjekk. Betal kun for det du trenger, når du trenger det.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                >
                  <span>Se våre pakker</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg text-white font-medium"
                >
                  Prøv en gratis demo
                </motion.button>
              </Link>
            </motion.div>
          </div>
          
          {/* Søk-tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="flex mb-4 border-b border-white/10">
                <button
                  onClick={() => setSearchType('address')}
                  className={`flex-1 py-2 text-center text-sm font-medium ${
                    searchType === 'address' 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Søk med adresse
                </button>
                <button
                  onClick={() => setSearchType('url')}
                  className={`flex-1 py-2 text-center text-sm font-medium ${
                    searchType === 'url' 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Finn.no URL
                </button>
              </div>
              
              {searchType === 'address' ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Skriv inn adressen du vil analysere..."
                    className="block w-full pl-10 pr-3 py-4 border border-white/10 rounded-lg bg-black/60 backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="absolute inset-y-0 right-0 px-4 flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-lg">
                    Analyser
                  </button>
                </div>
              ) : (
                <UrlPropertySearch />
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Tall og statistikk */}
      <div className="py-16 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-white mb-2">15.000+</h3>
              <p className="text-gray-400">Eiendommer analysert</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-2">98%</h3>
              <p className="text-gray-400">Fornøyde kunder</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-2">40+</h3>
              <p className="text-gray-400">Samarbeidspartnere</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-2">290M</h3>
              <p className="text-gray-400">Verdiøkning oppdaget</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hvordan det fungerer */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Slik fungerer det</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Få en profesjonell eiendomsanalyse på under 48 timer. Ingen abonnementer.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">1. Skriv inn adressen</h3>
              <p className="text-gray-400">
                Oppgi adressen du ønsker å analysere og velg hvilken type analyse du trenger.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">2. Vi analyserer</h3>
              <p className="text-gray-400">
                Våre eksperter og AI-verktøy analyserer tomten, reguleringer og gir deg en komplett vurdering.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">3. Få resultatet</h3>
              <p className="text-gray-400">
                Motta en detaljert rapport med 3D-modeller, byggemuligheter og økonomiske beregninger.
              </p>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/how-it-works">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg text-white font-medium flex items-center justify-center gap-2 mx-auto"
              >
                <span>Se mer om hvordan det fungerer</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* 3D-modell eksempler */}
      <Model3DShowcase />
      
      {/* For hvem */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">For alle innen eiendom</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Våre pay-as-you-go-løsninger er skreddersydd for ulike behov innen eiendomsmarkedet.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <Home className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Boligeiere og boligkjøpere</h3>
              <p className="text-gray-400 mb-6 flex-grow">
                Oppdage eiendommens potensial før kjøp eller planlegg utbygging/oppgradering av din nåværende bolig.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-300 text-sm">Finn skjulte byggemuligheter</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-300 text-sm">Vurder verdiøkning før renovering</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-300 text-sm">Visualiser mulige utbygginger</span>
                </li>
              </ul>
              <Link href="/for-homeowners">
                <button className="text-blue-400 flex items-center text-sm hover:text-blue-300">
                  <span>Les mer for boligeiere</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Eiendomsutviklere og investorer</h3>
              <p className="text-gray-400 mb-6 flex-grow">
                Få detaljert innsikt i utviklingsmuligheter, begrensninger og potensielle ROI for ulike eiendomsprosjekter.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-300 text-sm">Detaljerte reguleringsanalyser</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-300 text-sm">ROI-beregninger for ulike alternativer</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-300 text-sm">Fotorealistiske 3D-visninger</span>
                </li>
              </ul>
              <Link href="/for-developers">
                <button className="text-blue-400 flex items-center text-sm hover:text-blue-300">
                  <span>Les mer for utviklere</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Våre partnere</h3>
              <p className="text-gray-400 mb-6 flex-grow">
                Banker, forsikringsselskaper og entreprenører kan dra nytte av vår pay-as-you-go lead-generering.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-300 text-sm">Kvalifiserte leads fra eiendomsmarkedet</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-300 text-sm">Betal kun for faktiske leads</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-300 text-sm">Ingen faste kostnader eller bindingstid</span>
                </li>
              </ul>
              <Link href="/partners">
                <button className="text-blue-400 flex items-center text-sm hover:text-blue-300">
                  <span>Les mer for partnere</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-6"
          >
            Klar til å se eiendommens fulle potensial?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Start med en enkelt analyse og betal kun for det du trenger. Ingen abonnementer, ingen bindingstid.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium text-lg flex items-center justify-center gap-2"
              >
                <span>Registrer deg gratis</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg text-white font-medium text-lg"
              >
                Se våre priser
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Kundehistorier */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Suksesshistorier fra våre kunder</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Se hvordan våre analyser har hjulpet andre å finne og utnytte eiendommers potensial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6"
            >
              <div className="flex space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">
                "Vi oppdaget at vi kunne bygge på 40 kvm mer enn vi trodde var mulig. Analysen ga oss en klar plan som også arkitekten kunne bruke."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium">AS</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Andreas Solberg</h4>
                  <p className="text-gray-400 text-sm">Boligeier, Oslo</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6"
            >
              <div className="flex space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">
                "Som eiendomsinvestor har dette verktøyet spart meg for utallige timer med research. Jeg avdekket utbyggingsmuligheter i en tomt som økte verdien med 2.5 millioner."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium">MJ</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Morten Johansen</h4>
                  <p className="text-gray-400 text-sm">Eiendomsinvestor, Bergen</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6"
            >
              <div className="flex space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">
                "Som arkitekt har jeg integrert denne tjenesten i mitt arbeid. De detaljerte 3D-modellene og analysene gir et solid beslutningsgrunnlag tidlig i prosessen."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium">KL</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Kristine Larsen</h4>
                  <p className="text-gray-400 text-sm">Arkitekt, Trondheim</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}; 