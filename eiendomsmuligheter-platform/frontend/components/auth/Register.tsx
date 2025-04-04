import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff, AlertTriangle, User, Phone, Building, Check } from 'lucide-react';
import Link from 'next/link';

export const Register = () => {
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'bankid' | 'vipps'>('email');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'private', // private, business, developer
    companyName: '',
    organizationNumber: '',
    acceptTerms: false,
    acceptMarketing: false
  });
  
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMethodChange = (method: 'email' | 'bankid' | 'vipps') => {
    setRegistrationMethod(method);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateStep1 = () => {
    if (registrationMethod === 'email') {
      if (!formData.fullName || !formData.email || !formData.phone) {
        setError('Vennligst fyll ut alle påkrevde felt');
        return false;
      }
      
      // Enkel e-postvalidering
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Vennligst oppgi en gyldig e-postadresse');
        return false;
      }
      
      // Enkel telefonvalidering (8 siffer for Norge)
      if (!/^\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
        setError('Vennligst oppgi et gyldig telefonnummer (8 siffer)');
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (registrationMethod === 'email') {
      if (!formData.password || !formData.confirmPassword) {
        setError('Vennligst oppgi både passord og bekreft passord');
        return false;
      }
      
      if (formData.password.length < 8) {
        setError('Passordet må være minst 8 tegn');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passordene stemmer ikke overens');
        return false;
      }
      
      if (formData.userType === 'business' && (!formData.companyName || !formData.organizationNumber)) {
        setError('Vennligst fyll ut firmanavn og organisasjonsnummer');
        return false;
      }
      
      if (formData.userType === 'business' && !/^\d{9}$/.test(formData.organizationNumber)) {
        setError('Vennligst oppgi et gyldig organisasjonsnummer (9 siffer)');
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const validateStep3 = () => {
    if (!formData.acceptTerms) {
      setError('Du må akseptere vilkårene for å fortsette');
      return false;
    }
    
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Her ville normalt være et API-kall for å registrere brukeren
      // Simulerer en API-forsinkelse
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo-formål, simulerer vi vellykket registrering
      if (registrationMethod === 'email') {
        console.log('Registrering vellykket med e-post:', formData.email);
        window.location.href = '/register-success'; // Redirect til en bekreftelsesside
      } else if (registrationMethod === 'bankid') {
        console.log('Starter BankID-registrering');
        window.location.href = '/bankid-register'; // Redirect til en side som håndterer BankID-registrering
      } else if (registrationMethod === 'vipps') {
        console.log('Starter Vipps-registrering');
        window.location.href = '/vipps-register'; // Redirect til en side som håndterer Vipps-registrering
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Det oppstod en feil under registrering. Vennligst prøv igjen senere.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Opprett konto</h1>
          <p className="text-gray-400">
            Velg din foretrukne registreringsmetode
          </p>
        </div>

        {/* Registreringsmetoder */}
        <div className="flex border border-white/10 rounded-lg mb-8">
          <button
            onClick={() => handleMethodChange('email')}
            className={`flex-1 py-3 text-center rounded-l-lg ${
              registrationMethod === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-400 hover:bg-white/5'
            }`}
          >
            E-post
          </button>
          <button
            onClick={() => handleMethodChange('bankid')}
            className={`flex-1 py-3 text-center ${
              registrationMethod === 'bankid'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-400 hover:bg-white/5'
            }`}
          >
            BankID
          </button>
          <button
            onClick={() => handleMethodChange('vipps')}
            className={`flex-1 py-3 text-center rounded-r-lg ${
              registrationMethod === 'vipps'
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

        <form onSubmit={handleRegister}>
          {/* E-postregistrering - Steg 1 */}
          {registrationMethod === 'email' && step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Personlig informasjon</h2>

              <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-300 mb-2">
                  Fullt navn *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ola Nordmann"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 mb-2">
                  E-post *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="din@epost.no"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="phone" className="block text-gray-300 mb-2">
                  Telefon *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="98765432"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* E-postregistrering - Steg 2 */}
          {registrationMethod === 'email' && step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Konto og passord</h2>

              <div className="mb-6">
                <label htmlFor="userType" className="block text-gray-300 mb-2">
                  Kontotype *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'private' }))}
                    className={`p-3 flex flex-col items-center justify-center border rounded-lg cursor-pointer transition-colors ${
                      formData.userType === 'private'
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-black/30 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-white mb-1">Privatperson</span>
                    {formData.userType === 'private' && (
                      <Check className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'business' }))}
                    className={`p-3 flex flex-col items-center justify-center border rounded-lg cursor-pointer transition-colors ${
                      formData.userType === 'business'
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-black/30 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-white mb-1">Bedrift</span>
                    {formData.userType === 'business' && (
                      <Check className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'developer' }))}
                    className={`p-3 flex flex-col items-center justify-center border rounded-lg cursor-pointer transition-colors ${
                      formData.userType === 'developer'
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-black/30 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-white mb-1">Utvikler</span>
                    {formData.userType === 'developer' && (
                      <Check className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                </div>
              </div>

              {(formData.userType === 'business' || formData.userType === 'developer') && (
                <div className="mb-6 space-y-4">
                  <div>
                    <label htmlFor="companyName" className="block text-gray-300 mb-2">
                      Firmanavn *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={formData.userType === 'business' || formData.userType === 'developer'}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="organizationNumber" className="block text-gray-300 mb-2">
                      Organisasjonsnummer *
                    </label>
                    <input
                      type="text"
                      id="organizationNumber"
                      name="organizationNumber"
                      value={formData.organizationNumber}
                      onChange={handleInputChange}
                      placeholder="9 siffer"
                      className="block w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.userType === 'business' || formData.userType === 'developer'}
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-300 mb-2">
                  Passord *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minst 8 tegn"
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

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">
                  Bekreft passord *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Gjenta passord"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* E-postregistrering - Steg 3 */}
          {registrationMethod === 'email' && step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Vilkår og bekreftelse</h2>

              <div className="bg-black/30 border border-gray-700 rounded-lg p-6 mb-6 h-48 overflow-y-auto">
                <h3 className="text-lg font-medium text-white mb-3">Brukervilkår</h3>
                <p className="text-gray-300 mb-3">
                  Ved å registrere deg som bruker og bruke tjenestene til Eiendomsmuligheter Platform, godtar du følgende vilkår:
                </p>
                <ol className="list-decimal text-gray-300 pl-5 space-y-2">
                  <li>Analysene som tilbys er basert på tilgjengelige data og kan ikke garantere absolutt nøyaktighet.</li>
                  <li>Pay-as-you-go-kostnader vil belastes for hver analyse du bestiller, i henhold til gjeldende priser.</li>
                  <li>Du er ansvarlig for å sikre at informasjonen du gir er korrekt og fullstendig.</li>
                  <li>Eiendomsmuligheter Platform er ikke ansvarlig for beslutninger tatt basert på analyseresultatene.</li>
                  <li>Vi samler inn og behandler personopplysninger i henhold til vår personvernerklæring.</li>
                  <li>Du samtykker til at vi kan kontakte deg med relevant informasjon om tjenesten.</li>
                </ol>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 bg-black border-gray-500 rounded focus:ring-blue-500"
                      required
                    />
                  </div>
                  <label htmlFor="acceptTerms" className="ml-3 text-gray-300">
                    Jeg bekrefter at jeg har lest og godtar <span className="text-blue-400">brukervilkårene</span> og <span className="text-blue-400">personvernvilkårene</span>. *
                  </label>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="acceptMarketing"
                      name="acceptMarketing"
                      type="checkbox"
                      checked={formData.acceptMarketing}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 bg-black border-gray-500 rounded focus:ring-blue-500"
                    />
                  </div>
                  <label htmlFor="acceptMarketing" className="ml-3 text-gray-300">
                    Jeg ønsker å motta nyheter, tips og tilbud fra Eiendomsmuligheter Platform.
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* BankID registrering */}
          {registrationMethod === 'bankid' && (
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
              <h3 className="text-xl font-semibold text-white mb-2">Registrer deg med BankID</h3>
              <p className="text-gray-400 mb-6">
                Registrer deg raskt og sikkert med BankID. All nødvendig informasjon hentes automatisk fra Folkeregisteret.
              </p>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-gray-300">
                  Ved å bruke BankID for registrering, samtykker du til at vi kan hente dine personopplysninger fra Folkeregisteret og at du aksepterer våre <span className="text-blue-400">brukervilkår</span> og <span className="text-blue-400">personvernvilkår</span>.
                </p>
              </div>
            </div>
          )}

          {/* Vipps registrering */}
          {registrationMethod === 'vipps' && (
            <div className="py-6 text-center">
              <div className="p-6 mb-4 flex justify-center">
                {/* Simulert Vipps-logo (stilisert "V") */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                  V
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Registrer deg med Vipps</h3>
              <p className="text-gray-400 mb-6">
                Registrer deg enkelt med Vipps. Din identitet verifiseres automatisk, og du får en push-melding på telefonen din for å bekrefte registreringen.
              </p>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-gray-300">
                  Ved å bruke Vipps for registrering, samtykker du til at vi kan hente dine personopplysninger fra Vipps og at du aksepterer våre <span className="text-blue-400">brukervilkår</span> og <span className="text-blue-400">personvernvilkår</span>.
                </p>
              </div>
            </div>
          )}

          {/* Navigasjonsknapper for e-postregistrering */}
          {registrationMethod === 'email' && (
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-transparent border border-white/20 hover:bg-white/10 rounded-lg text-white font-medium"
                >
                  Tilbake
                </button>
              ) : (
                <div></div> // Tom div for å opprettholde flex-spacing
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center"
                >
                  <span>Neste</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 ${
                    isLoading ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'
                  } rounded-lg text-white font-medium flex items-center`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>Fullfør registrering</span>
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Knapp for BankID og Vipps */}
          {registrationMethod !== 'email' && (
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
                    {registrationMethod === 'bankid'
                      ? 'Start BankID-registrering'
                      : 'Fortsett med Vipps'}
                  </span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          )}
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Har du allerede en konto?{' '}
            <Link href="/login" className="text-blue-400 hover:underline">
              Logg inn her
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}; 