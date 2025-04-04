"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Mail, Eye, EyeOff, CheckCircle, 
  XCircle, LogIn, ChevronRight, AlertCircle, Phone 
} from 'lucide-react';
import Image from 'next/image';

type LoginMethod = 'email' | 'bankid' | 'vipps';

interface LoginSystemProps {
  onLogin?: (userData: any) => void;
  onRegister?: (userData: any) => void;
  className?: string;
}

export const LoginSystem = ({
  onLogin,
  onRegister,
  className = ''
}: LoginSystemProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulering av API-kall
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (activeTab === 'login') {
        // Håndter innlogging
        if (loginMethod === 'email') {
          if (!email || !password) {
            throw new Error('Vennligst fyll ut alle feltene');
          }
          
          // Simulerer vellykket innlogging
          if (onLogin) {
            onLogin({ email });
          }
          setSuccess('Innlogging vellykket! Omdirigerer...');
        } 
        else if (loginMethod === 'bankid') {
          // Simulere BankID-innlogging
          window.open('https://demo.bankid.no/', '_blank');
          setSuccess('BankID-innlogging initialisert...');
        } 
        else if (loginMethod === 'vipps') {
          // Simulere Vipps-innlogging
          setSuccess('Vipps-innlogging initialisert. Sjekk mobiltelefonen din...');
        }
      } 
      else if (activeTab === 'register') {
        // Håndter registrering
        if (!name || !email || !password || !phone) {
          throw new Error('Vennligst fyll ut alle feltene');
        }

        // Simulerer vellykket registrering
        if (onRegister) {
          onRegister({ name, email, phone });
        }
        setSuccess('Registrering vellykket! Bekreftelses-e-post sendt.');
      }
    } catch (err: any) {
      setError(err.message || 'En feil oppsto. Vennligst prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
    setSuccess('');
  };

  const LoginHeader = (): JSX.Element => (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">Logg inn på din konto</h2>
      <p className="text-gray-400">Fortsett til din personlige eiendomsanalyse-dashboard</p>
    </div>
  );

  const RegisterHeader = (): JSX.Element => (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">Opprett en ny konto</h2>
      <p className="text-gray-400">Registrer deg for å få tilgang til eiendomsanalyse-verktøy</p>
    </div>
  );

  return (
    <div className={`relative bg-gradient-to-b from-gray-900 via-gray-900 to-black ${className}`}>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:24px_24px]"></div>
      <div className="max-w-xl mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {/* Tab switching */}
          <div className="flex mb-8 border-b border-white/10">
            <button
              onClick={() => { setActiveTab('login'); resetForm(); }}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                activeTab === 'login' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Logg inn
            </button>
            <button
              onClick={() => { setActiveTab('register'); resetForm(); }}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                activeTab === 'register' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Registrer deg
            </button>
          </div>
          
          {/* Header content */}
          {activeTab === 'login' ? <LoginHeader /> : <RegisterHeader />}
          
          {/* Login method selection - only shown on login tab */}
          {activeTab === 'login' && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Velg innloggingsmetode:</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                    loginMethod === 'email'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <Mail className={`h-6 w-6 mb-2 ${loginMethod === 'email' ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${loginMethod === 'email' ? 'text-blue-400' : 'text-gray-400'}`}>
                    E-post
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setLoginMethod('bankid')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                    loginMethod === 'bankid'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className={`mb-2 ${loginMethod === 'bankid' ? 'text-blue-400' : 'text-gray-400'}`}>
                    <Image 
                      src="/assets/bankid-logo.svg" 
                      width={24} 
                      height={24} 
                      alt="BankID" 
                      className="h-6 w-6"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const div = document.createElement('div');
                          div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>';
                          parent.appendChild(div.firstChild as Node);
                        }
                      }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${loginMethod === 'bankid' ? 'text-blue-400' : 'text-gray-400'}`}>
                    BankID
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setLoginMethod('vipps')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                    loginMethod === 'vipps'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className={`mb-2 ${loginMethod === 'vipps' ? 'text-blue-400' : 'text-gray-400'}`}>
                    <Image 
                      src="/assets/vipps-logo.svg" 
                      width={24} 
                      height={24} 
                      alt="Vipps" 
                      className="h-6 w-6"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const div = document.createElement('div');
                          div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M3 10h18"/></svg>';
                          parent.appendChild(div.firstChild as Node);
                        }
                      }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${loginMethod === 'vipps' ? 'text-blue-400' : 'text-gray-400'}`}>
                    Vipps
                  </span>
                </button>
              </div>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {activeTab === 'login' && loginMethod === 'email' && (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-post</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="din@epost.no"
                        className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Passord</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 bg-gray-800 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                        Husk meg
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <a href="#" className="text-blue-400 hover:text-blue-300">
                        Glemt passord?
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'login' && loginMethod === 'bankid' && (
                <motion.div
                  key="bankid-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 py-4 text-center"
                >
                  <div className="flex justify-center">
                    <div className="p-6 bg-blue-900/20 rounded-full">
                      <Image 
                        src="/assets/bankid-large.svg" 
                        width={80} 
                        height={80} 
                        alt="BankID" 
                        className="h-16 w-16"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const div = document.createElement('div');
                            div.innerHTML = '<div class="h-16 w-16 flex items-center justify-center text-blue-500 text-2xl font-semibold">BankID</div>';
                            parent.appendChild(div.firstChild as Node);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-gray-300">Trykk på knappen under for å starte BankID-innlogging</p>
                  <p className="text-gray-500 text-sm">
                    Du vil bli omdirigert til BankID sin påloggingsside
                  </p>
                </motion.div>
              )}
              
              {activeTab === 'login' && loginMethod === 'vipps' && (
                <motion.div
                  key="vipps-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 py-4 text-center"
                >
                  <div className="flex justify-center">
                    <div className="p-6 bg-pink-900/20 rounded-full">
                      <Image 
                        src="/assets/vipps-large.svg" 
                        width={80} 
                        height={80} 
                        alt="Vipps" 
                        className="h-16 w-16"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const div = document.createElement('div');
                            div.innerHTML = '<div class="h-16 w-16 flex items-center justify-center text-pink-500 text-2xl font-semibold">Vipps</div>';
                            parent.appendChild(div.firstChild as Node);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-gray-300">Logg inn med Vipps-appen</p>
                  <p className="text-gray-500 text-sm">Du vil motta en varsel på telefonen din</p>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Telefonnummer</label>
                    <div className="relative max-w-xs mx-auto">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        pattern="[0-9]{8}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="12345678"
                        className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'register' && (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Navn</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ditt fulle navn"
                        className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-1">E-post</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="din@epost.no"
                        className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-300 mb-1">Telefonnummer</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="reg-phone"
                        type="tel"
                        pattern="[0-9]{8}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="12345678"
                        className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1">Passord</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Minst 8 tegn"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="h-4 w-4 bg-gray-800 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                      Jeg godtar <a href="#" className="text-blue-400 hover:text-blue-300">vilkårene</a> og <a href="#" className="text-blue-400 hover:text-blue-300">personvernerklæringen</a>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Error and success messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-3 rounded-lg flex items-start bg-red-900/20 border border-red-900/30"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-400">{error}</span>
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-3 rounded-lg flex items-start bg-green-900/20 border border-green-900/30"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-400">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Submit button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-all ${
                  loading 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : activeTab === 'login' ? (
                  <LogIn className="mr-2 h-5 w-5" />
                ) : (
                  <ChevronRight className="mr-2 h-5 w-5" />
                )}
                
                {activeTab === 'login' 
                  ? loginMethod === 'email' 
                    ? 'Logg inn' 
                    : loginMethod === 'bankid' 
                      ? 'Fortsett med BankID' 
                      : 'Fortsett med Vipps'
                  : 'Registrer deg'}
              </button>
            </div>
            
            {/* Alternative login */}
            {activeTab === 'login' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Har du ikke en konto? {' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); resetForm(); }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Registrer deg
                  </button>
                </p>
              </div>
            )}
            
            {activeTab === 'register' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Har du allerede en konto? {' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); resetForm(); }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Logg inn
                  </button>
                </p>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}; 