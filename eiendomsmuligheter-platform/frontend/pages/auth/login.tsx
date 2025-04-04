"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Key, AlertCircle, Eye, EyeOff, Fingerprint, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulerer innlogging - skal integreres med backend senere
    try {
      // Enkel validering
      if (!email || !password) {
        throw new Error('Vennligst fyll ut alle feltene');
      }
      
      // Når backend er implementert: 
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      
      // Simulerer vellykket innlogging
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Omdirigerer til hjemmesiden etter vellykket innlogging
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Kunne ikke logge inn. Vennligst prøv igjen.');
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
            Logg inn på din konto
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Eller{' '}
            <Link href="/auth/register" className="font-medium text-blue-400 hover:text-blue-300">
              registrer en ny konto
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md">
            {/* Email felt */}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-10 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="E-postadresse"
                />
              </div>
            </div>
            
            {/* Passord felt */}
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-10 py-3 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Passord"
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
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Husk meg
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                Glemt passord?
              </a>
            </div>
          </div>
          
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
              {isLoading ? 'Logger inn...' : 'Logg inn'}
            </motion.button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/60 text-gray-400">Eller logg inn med</span>
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