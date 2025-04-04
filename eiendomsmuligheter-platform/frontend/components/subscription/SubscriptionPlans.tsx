import React, { useState } from 'react';
import { Check, X, CreditCard, Building, Hammer, Home, User, ShieldCheck, Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LegalDisclaimer } from '../common/LegalDisclaimer';

// Typer brukergrupper
type UserType = 'personal' | 'professional' | 'partner';
type PaymentType = 'single' | 'bundle' | 'credit';

// Transaksjonskort-komponent
const TransactionCard = ({ 
  title,
  price,
  description,
  features,
  ctaText,
  isPopular,
  icon: Icon,
  savingsText
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-xl overflow-hidden ${
        isPopular 
          ? 'bg-gradient-to-br from-blue-600 to-purple-700 border-0 shadow-xl shadow-blue-500/20' 
          : 'bg-gradient-to-br from-gray-900 to-black border border-white/10'
      }`}
    >
      {isPopular && (
        <div className="bg-white/20 py-1.5 text-center text-sm font-medium text-white">
          Mest populær
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center mb-3">
          {Icon && <Icon className="w-5 h-5 text-blue-400 mr-2" />}
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">{description}</p>
        
        <div className="mb-2">
          <span className="text-3xl font-bold text-white">{price}</span>
          {price !== 'Tilbud' && <span className="text-gray-300 text-sm ml-1">per transaksjon</span>}
        </div>
        
        {savingsText && (
          <div className="mb-4 py-1 px-2 bg-green-500/20 rounded-full inline-flex items-center">
            <Zap className="h-3 w-3 text-green-400 mr-1" />
            <span className="text-xs text-green-400 font-medium">{savingsText}</span>
          </div>
        )}
        
        <ul className="space-y-2 mb-5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className="w-4 h-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
              )}
              <span className={feature.included ? 'text-gray-300 text-sm' : 'text-gray-500 text-sm'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
            isPopular 
              ? 'bg-white text-purple-700 hover:bg-gray-100' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {ctaText}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Hovedkomponent for subscriptionplans
export const SubscriptionPlans = () => {
  const [selectedUserType, setSelectedUserType] = useState<UserType>('personal');
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('single');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  // Privatpersoner - Enkeltanalyser
  const personalSinglePlans = [
    {
      title: "Basis Analyse",
      price: "995 kr",
      description: "Komplett analyse av én eiendom",
      ctaText: "Kjøp analyse",
      isPopular: false,
      savingsText: "Potensielt 50.000+ kr besparelse",
      icon: Home,
      features: [
        { text: "Reguleringssjekk og begrensninger", included: true },
        { text: "Grunnleggende byggemuligheter", included: true },
        { text: "PDF-rapport med anbefalinger", included: true },
        { text: "Én måneds tilgang til resultater", included: true },
        { text: "3D-visualisering", included: false },
        { text: "Økonomisk analyse", included: false },
      ]
    },
    {
      title: "Utviklingspakke",
      price: "4.950 kr",
      description: "Visualisering og utbyggingsmuligheter",
      ctaText: "Velg utviklingspakke",
      isPopular: true,
      savingsText: "Potensielt 200.000+ kr besparelse",
      icon: Home,
      features: [
        { text: "Alt fra Basis Analyse", included: true },
        { text: "3D-visualisering av byggemuligheter", included: true },
        { text: "To alternative utbyggingsforslag", included: true }, 
        { text: "Grunnleggende ROI-beregning", included: true },
        { text: "3 måneders tilgang til resultater", included: true },
        { text: "Fotorealistisk 3D-modell", included: false },
      ]
    },
    {
      title: "Premium Vurdering",
      price: "12.500 kr",
      description: "Komplett profesjonell analyse",
      ctaText: "Bestill vurdering",
      isPopular: false,
      savingsText: "Potensielt 500.000+ kr besparelse",
      icon: Home,
      features: [
        { text: "Alt fra Utviklingspakke", included: true },
        { text: "Fotorealistisk 3D-modellering", included: true },
        { text: "Komplett økonomisk analyse", included: true },
        { text: "Detaljerte anbefalinger", included: true },
        { text: "Ubegrenset tilgang til resultater", included: true },
        { text: "Prioritert kundesupport", included: true },
      ]
    }
  ];
  
  // Privatpersoner - Kredittbunter
  const personalCreditBundles = [
    {
      title: "10 Analyse-Kreditter",
      price: "7.950 kr",
      description: "Spar 20% med forhåndskjøp",
      ctaText: "Kjøp kreditter",
      isPopular: false,
      savingsText: "2.000 kr besparelse",
      icon: CreditCard,
      features: [
        { text: "10 Basis Analyser (verdi 9.950 kr)", included: true },
        { text: "Ubegrenset gyldighetstid", included: true },
        { text: "Kan brukes av hele familien", included: true },
        { text: "Kan oppgraderes til større analyser", included: true },
        { text: "Integrasjon med andre tjenester", included: false },
        { text: "Prioritert kundeservice", included: false },
      ]
    },
    {
      title: "5 Utviklingskreditter",
      price: "19.900 kr",
      description: "Utviklingsanalyser med rabatt",
      ctaText: "Velg utviklingspakke",
      isPopular: true,
      savingsText: "4.850 kr besparelse",
      icon: CreditCard,
      features: [
        { text: "5 Utviklingspakker (verdi 24.750 kr)", included: true },
        { text: "Ubegrenset gyldighetstid", included: true },
        { text: "Kan brukes av hele familien", included: true },
        { text: "Kan oppgraderes til Premium", included: true },
        { text: "Prioritert kundesupport", included: true },
        { text: "Dedikert kontaktperson", included: false },
      ]
    },
    {
      title: "Familiepakke",
      price: "29.950 kr",
      description: "Komplett løsning for hele familien",
      ctaText: "Kjøp familiepakke",
      isPopular: false,
      savingsText: "Over 10.000 kr besparelse",
      icon: Home,
      features: [
        { text: "20 Basis Analyser", included: true },
        { text: "3 Utviklingspakker", included: true },
        { text: "1 Premium Vurdering", included: true },
        { text: "Ubegrenset gyldighetstid", included: true },
        { text: "Prioritert kundesupport", included: true },
        { text: "Dedikert kontaktperson", included: true },
      ]
    }
  ];
  
  // Profesjonelle brukere - Enkeltanalyser
  const professionalSinglePlans = [
    {
      title: "Tomtevurdering",
      price: "4.950 kr",
      description: "Grunnleggende tomteanalyse",
      ctaText: "Kjøp analyse",
      isPopular: false,
      savingsText: "Komplett tomteanalyse",
      icon: Building,
      features: [
        { text: "Detaljert reguleringsanalyse", included: true },
        { text: "Byggemuligheter og begrensninger", included: true },
        { text: "PDF-rapport med funn", included: true },
        { text: "Grunnleggende 3D-visualisering", included: true },
        { text: "API-tilgang til data", included: false },
        { text: "White-label rapporter", included: false },
      ]
    },
    {
      title: "Prosjektvurdering",
      price: "14.950 kr",
      description: "Komplett utviklingsanalyse",
      ctaText: "Bestill vurdering",
      isPopular: true,
      savingsText: "ROI-optimalisert analyse",
      icon: Building,
      features: [
        { text: "Komplett regulerings- og byggeanalyse", included: true },
        { text: "Fotorealistisk 3D-visualisering", included: true },
        { text: "Økonomisk analyse og ROI-beregning", included: true },
        { text: "Tre alternative utviklingsforslag", included: true },
        { text: "API-tilgang til data", included: true },
        { text: "White-label rapporter", included: false },
      ]
    },
    {
      title: "Enterprise Analyse",
      price: "39.950 kr",
      description: "Premium utviklingsanalyse",
      ctaText: "Kontakt for tilbud",
      isPopular: false,
      savingsText: null,
      icon: Building,
      features: [
        { text: "Alt fra Prosjektvurdering", included: true },
        { text: "Komplett økonomisk modellering", included: true },
        { text: "White-label rapporter", included: true },
        { text: "Full API-integrasjon", included: true },
        { text: "Tilpassede analysemodeller", included: true },
        { text: "Dedikert prosjektleder", included: true },
      ]
    }
  ];
  
  // Profesjonelle brukere - Analysebunter
  const professionalCreditBundles = [
    {
      title: "Analysebundle Basic",
      price: "39.900 kr",
      description: "10 tomtevurderinger",
      ctaText: "Kjøp bundle",
      isPopular: false,
      savingsText: "9.600 kr rabatt",
      icon: CreditCard,
      features: [
        { text: "10 Tomtevurderinger (verdi 49.500 kr)", included: true },
        { text: "PDF og digitale rapporter", included: true },
        { text: "Export-funksjonalitet", included: true },
        { text: "Basic API-tilgang", included: true },
        { text: "White-label funksjonalitet", included: false },
        { text: "Delingstillatelser for samarbeidspartnere", included: false },
      ]
    },
    {
      title: "Analysebundle Pro",
      price: "99.500 kr",
      description: "Ideell for eiendomsmeglere og arkitekter",
      ctaText: "Kjøp Pro bundle",
      isPopular: true,
      savingsText: "25.000 kr rabatt",
      icon: CreditCard,
      features: [
        { text: "5 Tomtevurderinger", included: true },
        { text: "5 Prosjektvurderinger", included: true },
        { text: "White-label rapporter", included: true },
        { text: "Full API-tilgang", included: true },
        { text: "Delingstillatelser for samarbeidspartnere", included: true },
        { text: "Dedikert kontaktperson", included: true },
      ]
    },
    {
      title: "Enterprise Bundle",
      price: "Tilbud",
      description: "Skreddersydd for større selskaper",
      ctaText: "Be om tilbud",
      isPopular: false,
      savingsText: null,
      icon: Building,
      features: [
        { text: "Skreddersydde analyser for dine behov", included: true },
        { text: "Tilpasset API-integrasjon", included: true },
        { text: "White-label og merkevarebygging", included: true },
        { text: "Unlimited delingsrettigheter", included: true },
        { text: "Prioritert 24/7 support", included: true },
        { text: "Dedikert teknisk kontakt", included: true },
      ]
    }
  ];
  
  // Partner - Kreditter (f.eks. for entreprenører)
  const partnerCreditBundles = [
    {
      title: "Entreprenør Starter",
      price: "19.950 kr",
      description: "For små og mellomstore byggefirmaer",
      ctaText: "Kjøp pakke",
      isPopular: false,
      savingsText: "5.000 kr rabatt",
      icon: Hammer,
      features: [
        { text: "10 Basis Analyser for kundebruk", included: true },
        { text: "5 Utviklingspakker for eget bruk", included: true },
        { text: "Logosynlighet på rapporter", included: true },
        { text: "Ubegrenset gyldighetstid", included: true },
        { text: "Tilgang til leadgenerering", included: false },
        { text: "Prioritert plassering i søk", included: false },
      ]
    },
    {
      title: "Entreprenør Premium",
      price: "49.950 kr",
      description: "Komplett pakke for byggefirmaer",
      ctaText: "Kjøp Premium",
      isPopular: true,
      savingsText: "15.000 kr rabatt",
      icon: Hammer,
      features: [
        { text: "25 Basis Analyser for kundebruk", included: true },
        { text: "10 Utviklingspakker for eget bruk", included: true },
        { text: "2 Premium Vurderinger", included: true },
        { text: "Lead-generering i valgt område", included: true },
        { text: "Fremhevet profil på plattformen", included: true },
        { text: "API-integrasjon til eget CRM-system", included: true },
      ]
    },
    {
      title: "Bank Partner",
      price: "59.950 kr",
      description: "For banker og finansinstitusjoner",
      ctaText: "Kontakt for tilbud",
      isPopular: false,
      savingsText: null,
      icon: Building,
      features: [
        { text: "50 Basis Analyser for kunder", included: true },
        { text: "Lead-generering for boliglån", included: true },
        { text: "White-label kundevurderinger", included: true },
        { text: "API-integrasjon til eget system", included: true },
        { text: "Logovisning i alle rapporter", included: true },
        { text: "Kundekontaktmuligheter", included: true },
      ]
    }
  ];
  
  // Partner - Pay-per-lead
  const partnerPayPerLead = [
    {
      title: "Entreprenør Pay-Per-Lead",
      price: "450 kr",
      description: "Betal kun for faktiske leads",
      ctaText: "Start med leads",
      isPopular: true,
      savingsText: "Ingen faste kostnader",
      icon: Hammer,
      features: [
        { text: "Betal kun per kvalifisert lead", included: true },
        { text: "Ingen oppstartskostnader", included: true },
        { text: "Ingen månedlige avgifter", included: true },
        { text: "Målrettet etter region og type", included: true },
        { text: "Detaljert lead-informasjon", included: true },
        { text: "Ubegrenset leadvolum", included: true },
      ]
    },
    {
      title: "Forsikring Pay-Per-Lead",
      price: "350 kr",
      description: "For forsikringsselskaper",
      ctaText: "Start med leads",
      isPopular: false,
      savingsText: "Ingen bindingstid",
      icon: ShieldCheck,
      features: [
        { text: "Leads for bolig- og innboforsikring", included: true },
        { text: "Filtrert etter boligtype og verdi", included: true },
        { text: "Integrert med forsikringskalkulatorer", included: true },
        { text: "Ingen faste kostnader", included: true },
        { text: "Ubegrenset potensielt volum", included: true },
        { text: "Detaljert statistikk og innsikt", included: true },
      ]
    },
    {
      title: "Bank Pay-Per-Lead",
      price: "550 kr",
      description: "Boliglån-leads uten risiko",
      ctaText: "Start med leads",
      isPopular: false,
      savingsText: "ROI-optimalisert modell",
      icon: Building,
      features: [
        { text: "Kvalifiserte leads for boliglån", included: true },
        { text: "Komplett lånebehovvurdering", included: true },
        { text: "Filtrert etter lånekapasitet", included: true },
        { text: "Integrerbar i eksisterende systemer", included: true },
        { text: "Ubegrenset volum", included: true },
        { text: "Avvisningsrett for ukvalifiserte leads", included: true },
      ]
    }
  ];
  
  const getActivePlans = () => {
    if (selectedUserType === 'personal') {
      return selectedPaymentType === 'single' ? personalSinglePlans : personalCreditBundles;
    } else if (selectedUserType === 'professional') {
      return selectedPaymentType === 'single' ? professionalSinglePlans : professionalCreditBundles;
    } else {
      return selectedPaymentType === 'single' ? partnerPayPerLead : partnerCreditBundles;
    }
  };
  
  return (
    <div className="py-12 px-4 md:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Velg riktig løsning for dine behov</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            Ingen abonnementer eller bindingstid - betal kun for det du faktisk bruker, når du trenger det.
          </p>
          
          {/* Brukertype-valg */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedUserType('personal')}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
              selectedUserType === 'personal'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/15'
            }`}
          >
            <User size={18} />
            Privatperson
          </button>
          <button
            onClick={() => setSelectedUserType('professional')}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
              selectedUserType === 'professional'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/15'
            }`}
          >
            <Home size={18} />
            Profesjonell
          </button>
          <button
            onClick={() => setSelectedUserType('partner')}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
              selectedUserType === 'partner'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/15'
            }`}
          >
            <Building size={18} />
            Partner
          </button>
        </div>
        
          {/* Betalingsalternativ-valg */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedPaymentType('single')}
              className={`px-5 py-2.5 rounded-lg font-medium ${
                selectedPaymentType === 'single'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              {selectedUserType === 'partner' ? 'Pay-Per-Lead' : 'Enkeltanalyser'}
            </button>
            <button
              onClick={() => setSelectedPaymentType('credit')}
              className={`px-5 py-2.5 rounded-lg font-medium ${
                selectedPaymentType === 'credit'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              {selectedUserType === 'partner' ? 'Kredittbunter' : 'Flerkjøpsrabatter'}
            </button>
          </div>
        </div>
        
        {/* Plankort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {getActivePlans().map((plan, index) => (
            <TransactionCard 
              key={index}
              title={plan.title}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              ctaText={plan.ctaText}
              isPopular={plan.isPopular}
              icon={plan.icon}
              savingsText={plan.savingsText}
            />
          ))}
        </div>
        
        {/* Fordeler */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Hvorfor velge vår Pay-As-You-Go modell?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Check className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Ingen faste kostnader</h4>
                <p className="text-gray-400 text-sm">Betal kun for det du bruker, når du trenger det - ingen månedlige utgifter.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Check className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Maksimal verdi</h4>
                <p className="text-gray-400 text-sm">Hver analyse er optimalisert for å gi maksimal verdi og potensielt spare deg for hundretusener av kroner.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Check className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Total fleksibilitet</h4>
                <p className="text-gray-400 text-sm">Velg akkurat de analysene du trenger, når du trenger dem, uten langsiktige forpliktelser.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Check className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Perfekt for familiebruk</h4>
                <p className="text-gray-400 text-sm">Del analysekreditter med familiemedlemmer for å vurdere flere eiendommer sammen.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Juridisk informasjon og ansvarsfraskrivelse */}
        <div className="text-center">
          <button 
            onClick={() => setShowDisclaimer(true)}
            className="flex items-center mx-auto text-gray-400 text-sm hover:text-gray-300"
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Juridisk informasjon og ansvarsfraskrivelse
          </button>
          
          {showDisclaimer && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">Juridisk informasjon</h3>
                
                <div className="text-gray-300 text-sm space-y-4 mb-6">
                  <p>Eiendomsmuligheter Platform tilbyr transaksjonsbaserte analysetjenester som er ment som veiledende informasjon og beslutningsstøtte. Plattformen og dens eiere tar ikke noe juridisk ansvar for beslutninger tatt basert på den tilbudte informasjonen.</p>
                  
                  <p>Analysene er basert på tilgjengelige offentlige data, og selv om vi bestreber oss på å gi nøyaktig informasjon, kan vi ikke garantere for fullstendighet, nøyaktighet eller anvendelighet for spesifikke formål.</p>
                  
                  <p>Brukeren er selv ansvarlig for å verifisere informasjonen med relevante myndigheter og eksperthjelp før de tar viktige beslutninger om eiendomskjøp, -utvikling eller investeringer.</p>
                  
                  <p>Ved å bruke vår tjeneste, godtar du at verken Eiendomsmuligheter Platform eller dets eiere, ansatte, agenter eller partnere er ansvarlige for direkte, indirekte, tilfeldige, følgeskader eller spesielle skader som måtte oppstå som følge av bruk av plattformen eller informasjonen som tilbys.</p>
                  
                  <p>For partnere, inkludert banker, forsikringsselskaper og entreprenører, er lead-generering basert på Pay-Per-Lead modell. Plattformen garanterer ikke kvaliteten eller konverteringsraten på leads, og partnere kjøper leads på eget ansvar.</p>
                </div>
                
                <button 
                  onClick={() => setShowDisclaimer(false)}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium text-white"
                >
                  Jeg forstår
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 