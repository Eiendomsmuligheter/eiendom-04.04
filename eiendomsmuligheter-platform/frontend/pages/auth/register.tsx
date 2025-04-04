"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Key, User, AlertCircle, Eye, EyeOff, Building, Fingerprint, CreditCard, Check } from 'lucide-react';

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    orgNumber: '',
    companyType: '',
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  const validateForm = () => {
    // Personlig validering
    if (activeTab === 'personal') {
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Vennligst fyll ut alle påkrevde felt');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passordene samsvarer ikke');
        return false;
      }
      
      if (formData.password.length < 8) {
        setError('Passordet må være minst 8 tegn');
        return false;
      }
    } 
    // Bedriftsvalidering
    else {
      if (!formData.companyName || !formData.email || !formData.password || !formData.companyType) {
        setError('Vennligst fyll ut alle påkrevde felt');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passordene samsvarer ikke');
        return false;
      }
      
      if (!formData.termsAccepted) {
        setError('Du må godta vilkårene for å fortsette');
        return false;
      }
    }
    
    return true;
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulerer registrering - skal integreres med backend senere
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulerer vellykket registrering
      window.location.href = activeTab === 'personal' 
        ? '/dashboard' 
        : '/partner/onboarding';
    } catch (err: any) {
      setError(err.message || 'Kunne ikke registrere. Vennligst prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800/60 p-8 rounded-xl border border-white/10 backdrop-blur-sm">
        <div>
          <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Tilbake til hjemmesiden
          </Link>
          
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            Opprett ny konto
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Eller{' '}
            <Link href="/auth/login" className="font-medium text-blue-400 hover:text-blue-300">
              logg inn på din eksisterende konto
            </Link>
          </p>
        </div>
        
        {/* Faner for å velge registreringstype */}
        <div className="flex bg-gray-700/30 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${
              activeTab === 'personal'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            Personlig konto
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex-1 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${
              activeTab === 'business'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Building className="h-4 w-4 mr-2" />
            Bedrift / Partner
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4 rounded-md">
            {/* Personlig informasjon */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="sr-only">
                    Fullt navn
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-10 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Fullt navn"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Bedriftsinformasjon */}
            {activeTab === 'business' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="sr-only">
                    Firmanavn
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-10 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Firmanavn"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="orgNumber" className="sr-only">
                    Organisasjonsnummer
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">Org#</span>
                    </div>
                    <input
                      id="orgNumber"
                      name="orgNumber"
                      type="text"
                      value={formData.orgNumber}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-16 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9 siffer (valgfritt)"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="companyType" className="sr-only">
                    Type bedrift
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="companyType"
                      name="companyType"
                      required
                      value={formData.companyType}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-10 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" disabled>Velg type bedrift</option>
                      <option value="bank">Bank / Finansinstitusjon</option>
                      <option value="insurance">Forsikringsselskap</option>
                      <option value="contractor">Entreprenør / Byggebedrift</option>
                      <option value="realEstate">Eiendomsmegler</option>
                      <option value="other">Annen type</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Felles felter for begge typer */}
            <div>
              <label htmlFor="email" className="sr-only">
                E-postadresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-10 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="E-postadresse"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Passord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-10 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Passord (minst 8 tegn)"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Bekreft passord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-10 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bekreft passord"
                />
              </div>
            </div>
          </div>
          
          {activeTab === 'business' && (
            <div className="flex items-center">
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                required
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-300">
                Jeg godtar <a href="#" className="text-blue-400 hover:text-blue-300">vilkårene</a> for partnere
              </label>
            </div>
          )}
          
          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                isLoading 
                  ? 'bg-blue-600/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isLoading ? 'Registrerer...' : 'Registrer deg'}
            </motion.button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/60 text-gray-400">Eller registrer med</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-white bg-gray-700/30 hover:bg-gray-700/50"
            >
              <Fingerprint className="h-5 w-5 mr-2 text-blue-400" />
              BankID
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-white bg-gray-700/30 hover:bg-gray-700/50"
            >
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center mr-2">
                  <CreditCard className="h-3 w-3 text-white" />
                </div>
                Vipps
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
} 