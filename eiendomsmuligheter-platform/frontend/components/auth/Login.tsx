import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const Login = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'bankid' | 'vipps'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMethodChange = (method: 'email' | 'bankid' | 'vipps') => {
    setLoginMethod(method);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Her ville normalt være et API-kall for å autentisere brukeren
      // Simulerer en API-forsinkelse
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo-formål, simulerer vi en vellykket innlogging for alle metoder
      if (loginMethod === 'email') {
        // Her ville man typisk validere e-post og passord
        if (!email || !password) {
          throw new Error('Vennligst fyll ut både e-post og passord');
        }
        
        // Enkel e-postvalidering
        if (!/\S+@\S+\.\S+/.test(email)) {
          throw new Error('Vennligst skriv inn en gyldig e-postadresse');
        }
        
        // For demoen, la oss si at innlogging er vellykket hvis e-post og passord er fylt ut
        console.log('Innlogging vellykket med e-post:', email);
        window.location.href = '/dashboard'; // Redirect til dashboard etter vellykket innlogging
      } else if (loginMethod === 'bankid') {
        // Her ville man normalt starte BankID-autentisering
        console.log('Starter BankID-autentisering');
        
        // For demo-formål, simulerer vi at BankID-prosessen starter
        window.location.href = '/bankid-auth'; // Redirect til en side som håndterer BankID-autentisering
      } else if (loginMethod === 'vipps') {
        // Her ville man normalt starte Vipps-autentisering
        console.log('Starter Vipps-autentisering');
        
        // For demo-formål, simulerer vi at Vipps-prosessen starter
        window.location.href = '/vipps-auth'; // Redirect til en side som håndterer Vipps-autentisering
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Det oppstod en feil under innlogging. Vennligst prøv igjen senere.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Logg inn</h1>
          <p className="text-gray-400">
            Velkommen tilbake! Velg din foretrukne innloggingsmetode
          </p>
        </div>

        {/* Innloggingsmetoder */}
        <div className="flex border border-white/10 rounded-lg mb-8">
          <button
            onClick={() => handleMethodChange('email')}
            className={`flex-1 py-3 text-center rounded-l-lg ${
              loginMethod === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-400 hover:bg-white/5'
            }`}
          >
            E-post
          </button>
          <button
            onClick={() => handleMethodChange('bankid')}
            className={`flex-1 py-3 text-center ${
              loginMethod === 'bankid'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-400 hover:bg-white/5'
            }`}
          >
            BankID
          </button>
          <button
            onClick={() => handleMethodChange('vipps')}
            className={`flex-1 py-3 text-center rounded-r-lg ${
              loginMethod === 'vipps'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-400 hover:bg-white/5'
            }`}
          >
            Vipps
          </button>
        </div>

        {/* Feilmelding */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* E-post/passordinnlogging */}
          {loginMethod === 'email' && (
            <>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 mb-2">
                  E-post
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="din@epost.no"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-300 mb-2">
                  Passord
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 bg-black border-gray-700 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-gray-400">
                    Husk meg
                  </label>
                </div>
                <Link href="/forgot-password" className="text-blue-400 hover:underline">
                  Glemt passord?
                </Link>
              </div>
            </>
          )}

          {/* BankID */}
          {loginMethod === 'bankid' && (
            <div className="py-6 text-center">
              <div className="p-6 mb-4 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  width="80"
                  height="80"
                  className="text-blue-500"
                >
                  <path
                    fill="currentColor"
                    d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5zm0 80c-19.3 0-35-15.7-35-35s15.7-35 35-35 35 15.7 35 35-15.7 35-35 35z"
                  />
                  <path
                    fill="currentColor"
                    d="M70 42H30c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h40c1.1 0 2-.9 2-2V44c0-1.1-.9-2-2-2zM48 52h-4v-4h4v4zm8 0h-4v-4h4v4zm8 0h-4v-4h4v4z"
                  />
                  <path
                    fill="currentColor"
                    d="M70 35H30c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h40c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Logg inn med BankID</h3>
              <p className="text-gray-400 mb-6">
                Logg inn enkelt og sikkert med BankID. Trykk på knappen nedenfor for å starte BankID-autentisering.
              </p>
            </div>
          )}

          {/* Vipps */}
          {loginMethod === 'vipps' && (
            <div className="py-6 text-center">
              <div className="p-6 mb-4 flex justify-center">
                {/* Simulert Vipps-logo (stilisert "V") */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                  V
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Logg inn med Vipps</h3>
              <p className="text-gray-400 mb-6">
                Logg inn raskt og enkelt med Vipps. Trykk på knappen nedenfor for å få en push-melding på telefonen din.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 ${
              isLoading ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'
            } rounded-lg text-white font-medium flex items-center justify-center`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span>
                  {loginMethod === 'email'
                    ? 'Logg inn'
                    : loginMethod === 'bankid'
                    ? 'Start BankID-innlogging'
                    : 'Fortsett med Vipps'}
                </span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Har du ikke en konto?{' '}
            <Link href="/register" className="text-blue-400 hover:underline">
              Registrer deg her
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}; 