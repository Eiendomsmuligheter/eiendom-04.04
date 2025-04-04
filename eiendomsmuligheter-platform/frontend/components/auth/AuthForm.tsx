import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, ChevronRight, CreditCard, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

type AuthMode = 'login' | 'register';
type AuthMethod = 'email' | 'bankid' | 'vipps';

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Validering
      if (method === 'email') {
        if (!email) {
          throw new Error('E-post er påkrevd');
        }
        
        if (mode === 'register') {
          if (!name) {
            throw new Error('Navn er påkrevd');
          }
          
          if (!password) {
            throw new Error('Passord er påkrevd');
          }
          
          if (password.length < 8) {
            throw new Error('Passordet må være minst 8 tegn');
          }
          
          if (password !== confirmPassword) {
            throw new Error('Passordene er ikke like');
          }
        }
      }
      
      // Faktisk autentisering ville skje her
      console.log('Autentisering med', { mode, method, email, password, name });
      
      // Simulere en API-kall
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Resultat
      if (mode === 'login') {
        console.log('Innlogging vellykket');
        // Redirect til dashboard
      } else {
        console.log('Registrering vellykket');
        // Redirect til verifisering eller dashboard
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "En feil oppsto under autentisering");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Logg inn' : 'Registrer deg'}
            </h2>
            <div className="flex">
              <button
                onClick={() => setMode('login')}
                className={`px-3 py-1 text-sm rounded-l-lg ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Logg inn
              </button>
              <button
                onClick={() => setMode('register')}
                className={`px-3 py-1 text-sm rounded-r-lg ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Registrer
              </button>
            </div>
          </div>
        </div>
        
        {/* Auth metode velger */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setMethod('email')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                  method === 'email'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Mail size={18} />
                <span>E-post</span>
              </button>
              <button
                onClick={() => setMethod('bankid')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                  method === 'bankid'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <CreditCard size={18} />
                <span>BankID</span>
              </button>
              <button
                onClick={() => setMethod('vipps')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                  method === 'vipps'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Smartphone size={18} />
                <span>Vipps</span>
              </button>
            </div>
          </div>
          
          {/* Email/Passord form */}
          {method === 'email' && (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {mode === 'register' && (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-300 mb-2 text-sm">Navn</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 pl-10 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Ditt fulle navn"
                    />
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 mb-2 text-sm">E-post</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="navn@eksempel.no"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-300 mb-2 text-sm">Passord</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ditt passord"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              
              {mode === 'register' && (
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-gray-300 mb-2 text-sm">Bekreft passord</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 pl-10 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Gjenta passordet"
                    />
                  </div>
                </div>
              )}
              
              {mode === 'login' && (
                <div className="flex justify-end mb-4">
                  <a href="#" className="text-blue-400 text-sm hover:text-blue-300">Glemt passord?</a>
                </div>
              )}
              
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium flex items-center justify-center gap-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Laster...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Logg inn' : 'Registrer deg'}</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          )}
          
          {/* BankID-autentisering */}
          {method === 'bankid' && (
            <div className="text-center">
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-6 mb-4">
                <CreditCard className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">BankID-innlogging</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Sikker innlogging med din BankID. Ingen ekstra kostnader.
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => console.log('BankID-innlogging klikket')}
                  className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium flex items-center justify-center gap-2"
                >
                  Start BankID-innlogging
                  <ChevronRight size={18} />
                </motion.button>
              </div>
              
              <p className="text-gray-400 text-sm">
                Ved å logge inn med BankID godtar du våre <a href="#" className="text-blue-400">vilkår og betingelser</a> og <a href="#" className="text-blue-400">personvernerklæring</a>.
              </p>
            </div>
          )}
          
          {/* Vipps-autentisering */}
          {method === 'vipps' && (
            <div className="text-center">
              <div className="bg-orange-900/20 border border-orange-800/30 rounded-lg p-6 mb-4">
                <Smartphone className="w-16 h-16 mx-auto text-orange-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Vipps-innlogging</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Rask og enkel innlogging med Vipps. Ingen ekstra kostnader.
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => console.log('Vipps-innlogging klikket')}
                  className="w-full p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium flex items-center justify-center gap-2"
                >
                  Start Vipps-innlogging
                  <ChevronRight size={18} />
                </motion.button>
              </div>
              
              <p className="text-gray-400 text-sm">
                Ved å logge inn med Vipps godtar du våre <a href="#" className="text-blue-400">vilkår og betingelser</a> og <a href="#" className="text-blue-400">personvernerklæring</a>.
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-black/30 border-t border-gray-800">
          <p className="text-gray-400 text-sm text-center">
            {mode === 'login'
              ? 'Har du ikke konto? '
              : 'Har du allerede en konto? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-400 hover:text-blue-300"
            >
              {mode === 'login' ? 'Registrer deg' : 'Logg inn'}
            </button>
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">
          Ved å logge inn godtar du våre <a href="#" className="text-blue-400">vilkår og betingelser</a> og <a href="#" className="text-blue-400">personvernerklæring</a>.
        </p>
      </div>
    </div>
  );
}; 