import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, ArrowRight, Shield, X } from 'lucide-react';

export const InsuranceRegistration = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    organizationNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    insuranceTypes: [] as string[],
    agreesToTerms: false,
    marketingConsent: false
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insuranceTypeOptions = [
    'Boligforsikring',
    'Innboforsikring',
    'Bygningsforsikring',
    'Prosjektforsikring',
    'Ansvarsforsikring',
    'Eierskifteforsikring',
    'Forskuddsgaranti'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleInsuranceTypeToggle = (type: string) => {
    setFormData(prev => {
      if (prev.insuranceTypes.includes(type)) {
        return {
          ...prev,
          insuranceTypes: prev.insuranceTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          insuranceTypes: [...prev.insuranceTypes, type]
        };
      }
    });
  };

  const validateStep1 = () => {
    if (!formData.companyName || !formData.organizationNumber || !formData.contactPerson || !formData.email || !formData.phone) {
      setError('Vennligst fyll ut alle påkrevde felt');
      return false;
    }
    
    // Enkel e-postvalidering
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Vennligst oppgi en gyldig e-postadresse');
      return false;
    }

    // Organisasjonsnummer-validering (9 siffer for norske selskaper)
    if (!/^\d{9}$/.test(formData.organizationNumber)) {
      setError('Vennligst oppgi et gyldig organisasjonsnummer (9 siffer)');
      return false;
    }

    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (formData.insuranceTypes.length === 0) {
      setError('Vennligst velg minst én forsikringstype');
      return false;
    }

    setError(null);
    return true;
  };

  const validateStep3 = () => {
    if (!formData.agreesToTerms) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Her ville det normalt være en API-kall for å sende dataene
      // Simulerer en API-forsinkelse med timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
    } catch (err) {
      setError('Det oppstod en feil ved innsending av skjemaet. Vennligst prøv igjen senere.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Takk for din interesse!</h2>
          <p className="text-gray-300 text-xl mb-6">
            Din registrering som forsikringspartner er mottatt. En av våre partneransvarlige vil kontakte deg innen 1-2 virkedager for å diskutere samarbeidet videre.
          </p>
          <p className="text-gray-400 mb-8">
            I mellomtiden vil du motta en e-post med bekreftelse og mer informasjon om vårt partnerprogram for forsikringsselskaper.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center"
            >
              Tilbake til forsiden
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Bli forsikringspartner</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Få tilgang til kvalifiserte leads innen eiendomsutvikling med vår pay-as-you-go-løsning for forsikringsselskaper.
        </p>
      </div>

      {/* Fremdriftssteg */}
      <div className="mb-10">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="relative">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    s === step ? 'bg-blue-600 text-white' : 
                    s < step ? 'bg-green-500 text-white' : 
                    'bg-gray-700 text-gray-400'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                <span className={`absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm ${
                  s <= step ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {s === 1 ? 'Bedriftsinformasjon' : s === 2 ? 'Forsikringstyper' : 'Vilkår'}
                </span>
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-700'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8">
        <form onSubmit={handleSubmit}>
          {/* Steg 1: Bedriftsinformasjon */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Bedriftsinformasjon</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="companyName" className="block text-gray-300 mb-2">Selskapsnavn *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="organizationNumber" className="block text-gray-300 mb-2">Organisasjonsnummer *</label>
                  <input
                    type="text"
                    id="organizationNumber"
                    name="organizationNumber"
                    value={formData.organizationNumber}
                    onChange={handleInputChange}
                    placeholder="9 siffer"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="contactPerson" className="block text-gray-300 mb-2">Kontaktperson *</label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-2">E-post *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="phone" className="block text-gray-300 mb-2">Telefon *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-gray-300 mb-2">Nettside</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Steg 2: Forsikringstyper */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Hvilke forsikringstyper tilbyr dere?</h2>
              <p className="text-gray-400 mb-6">
                Velg alle forsikringstyper som er relevante for eiendomsutvikling og -investering.
                Dette hjelper oss å koble dere med de rette kundene.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {insuranceTypeOptions.map((type) => (
                  <div 
                    key={type} 
                    onClick={() => handleInsuranceTypeToggle(type)}
                    className={`p-4 border ${
                      formData.insuranceTypes.includes(type) 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-gray-700 bg-black/30'
                    } rounded-lg cursor-pointer hover:bg-gray-800 transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 flex-shrink-0 border ${
                        formData.insuranceTypes.includes(type) ? 'border-blue-500 bg-blue-500' : 'border-gray-500'
                      } rounded flex items-center justify-center mr-3`}>
                        {formData.insuranceTypes.includes(type) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-white">{type}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-400 mt-1" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-white">Pay-as-you-go-modell</h3>
                    <p className="text-gray-300 mt-1">
                      Som forsikringspartner betaler du kun for faktiske leads generert gjennom Plattformen.
                      Ingen faste avgifter, ingen abonnementer. Fakturagrunnlag sendes månedlig basert på faktisk aktivitet.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Steg 3: Vilkår */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Partnerskapsvilkår</h2>
              
              <div className="bg-black/30 border border-gray-700 rounded-lg p-6 mb-8 h-64 overflow-y-auto">
                <h3 className="text-xl font-medium text-white mb-4">Partneravtale for forsikringsselskaper</h3>
                
                <p className="text-gray-300 mb-4">
                  <strong>1. Partnerforhold</strong><br />
                  Denne avtalen ("Avtalen") inngås mellom det registrerte forsikringsselskapet ("Partneren") og Eiendomsmuligheter Platform AS ("Plattformen"). Avtalen regulerer vilkårene for Partnerens deltakelse i Plattformens lead-genereringsprogram.
                </p>
                
                <p className="text-gray-300 mb-4">
                  <strong>2. Pay-as-you-go-prinsipp</strong><br />
                  Partneren betaler kun for faktiske leads generert gjennom Plattformen. Det er ingen faste avgifter eller bindingstid. Et "lead" defineres som en bruker av Plattformen som aktivt forespør kontakt eller informasjon om forsikringstjenester som tilbys av Partneren.
                </p>
                
                <p className="text-gray-300 mb-4">
                  <strong>3. Priser og fakturering</strong><br />
                  Gjeldende priser for leads fremgår av Plattformens prisutgave for forsikringspartnere. Fakturering skjer månedlig basert på antall genererte leads. Betalingsfrist er 14 dager fra fakturadato.
                </p>
                
                <p className="text-gray-300 mb-4">
                  <strong>4. Leads-kvalitet og reklamasjoner</strong><br />
                  Plattformen forplikter seg til å levere kvalifiserte leads basert på brukernes egne forespørsler. Reklamasjoner på leads må fremsettes innen 7 dager etter mottak av leaden.
                </p>
                
                <p className="text-gray-300 mb-4">
                  <strong>5. Oppsigelse</strong><br />
                  Begge parter kan si opp avtalen med 30 dagers skriftlig varsel. Partneren er ansvarlig for betaling av alle leads generert frem til oppsigelsestidspunktet.
                </p>
                
                <p className="text-gray-300 mb-4">
                  <strong>6. Ansvarsfraskrivelse</strong><br />
                  Plattformen er ikke ansvarlig for tap eller skade som følge av Partnerens bruk av leads generert via Plattformen. Plattformen tar ikke ansvar for resultatet av forsikringsavtaler eller andre forretningsmessige forhold mellom Partneren og sluttkunder.
                </p>
                
                <p className="text-gray-300 mb-4">
                  <strong>7. Gjeldende lov</strong><br />
                  Denne avtalen er underlagt norsk lov, og tvister skal løses ved ordinær domstolsbehandling med Oslo tingrett som verneting.
                </p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-start mb-4">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="agreesToTerms"
                      name="agreesToTerms"
                      type="checkbox"
                      checked={formData.agreesToTerms}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 bg-black border-gray-500 rounded focus:ring-blue-500"
                      required
                    />
                  </div>
                  <label htmlFor="agreesToTerms" className="ml-3 text-gray-300">
                    Jeg bekrefter at jeg har lest og godtar <span className="text-blue-400">partneravtalen</span> og <span className="text-blue-400">personvernvilkårene</span>. *
                  </label>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="marketingConsent"
                      name="marketingConsent"
                      type="checkbox"
                      checked={formData.marketingConsent}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 bg-black border-gray-500 rounded focus:ring-blue-500"
                    />
                  </div>
                  <label htmlFor="marketingConsent" className="ml-3 text-gray-300">
                    Jeg ønsker å motta nyheter, oppdateringer og invitasjoner til partnerarrangementer fra Eiendomsmuligheter Platform.
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feilmelding */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-red-400">{error}</p>
                </div>
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigasjonsknapper */}
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
                disabled={isSubmitting}
                className={`px-8 py-3 ${
                  isSubmitting ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'
                } rounded-lg text-white font-medium flex items-center`}
              >
                {isSubmitting ? 'Sender inn...' : 'Send inn registrering'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Informasjonsboks */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-3">Pay-as-you-go</h3>
          <p className="text-gray-300 mb-4">
            Betal kun for faktiske leads. Ingen faste kostnader eller bindingstid.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-300 text-sm">Fra 950 kr per kvalifisert lead</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-300 text-sm">Månedlig fakturering</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-300 text-sm">Ingen startavgift</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-3">Kvalifiserte leads</h3>
          <p className="text-gray-300 mb-4">
            Få direkte kontakt med relevante potensielle kunder i eiendomsmarkedet.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-300 text-sm">Nøyaktig segmentering etter forsikringstype</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-300 text-sm">Leads med høy konverteringsrate</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-300 text-sm">Kunder klare for forsikringstilbud</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-3">Fordeler som partner</h3>
          <p className="text-gray-300 mb-4">
            Dra nytte av vår sterke posisjon i eiendomsmarkedet.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-300 text-sm">Synlighet i vår partneroversikt</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-300 text-sm">Invitasjoner til ekskusive partnerarrangementer</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-300 text-sm">Tilgang til markedsinnsikt og trender</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 