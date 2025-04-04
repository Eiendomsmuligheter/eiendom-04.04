"use client";

import React from 'react';
import { Check, X, CreditCard, ArrowRight, AlertTriangle, Building, Home, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LegalDisclaimer } from './common/LegalDisclaimer';

// Definerer typer for state
type PricingState = {
  selectedTab: 'single' | 'credit';
  showDisclaimer: boolean;
};

// Pay-as-you-go prisingsmodell for sluttbrukere
export default class Pricing extends React.Component<{}, PricingState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      selectedTab: 'single',
      showDisclaimer: false
    };
  }

  // Enkeltanalyser
  singlePlans = [
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
  
  // Kredittbunter
  creditBundles = [
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
  
  // Transaksjonskortkort-komponent
  TransactionCard = ({ 
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
            <span className="text-gray-300 text-sm ml-1">{this.state.selectedTab === 'single' ? 'per analyse' : 'for pakken'}</span>
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

  setSelectedTab = (tab) => {
    this.setState({ selectedTab: tab });
  }

  setShowDisclaimer = (show) => {
    this.setState({ showDisclaimer: show });
  }
  
  render() {
  return (
      <div className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Invester i eiendomsinnsikt - betal kun for det du trenger</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Ingen abonnementer. Ingen bindingstid. Få profesjonelle eiendomsanalyser når du trenger det.
            </p>
            
            {/* Toppvelger */}
            <div className="inline-flex bg-white/5 p-1 rounded-lg border border-white/10 mb-6">
              <button
                onClick={() => this.setSelectedTab('single')}
                className={`px-5 py-2 rounded-lg text-sm font-medium ${
                  this.state.selectedTab === 'single'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'text-gray-300'
                }`}
              >
                Enkeltanalyser
              </button>
              <button
                onClick={() => this.setSelectedTab('credit')}
                className={`px-5 py-2 rounded-lg text-sm font-medium ${
                  this.state.selectedTab === 'credit'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'text-gray-300'
                }`}
              >
                Kredittbunter
              </button>
            </div>
        </div>
        
          {/* Prisplaner */}
          <AnimatePresence mode="wait">
        <motion.div
              key={this.state.selectedTab}
          initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {this.state.selectedTab === 'single' 
                ? this.singlePlans.map((plan, index) => (
                  <this.TransactionCard 
                    key={index}
                    {...plan}
                  />
                ))
                : this.creditBundles.map((bundle, index) => (
                  <this.TransactionCard 
              key={index}
                    {...bundle}
                  />
                ))
              }
        </motion.div>
          </AnimatePresence>
          
          {/* Fordeler-seksjon */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Hvorfor velge vår Pay-As-You-Go modell?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Check className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Ingen abonnement</h4>
                  <p className="text-gray-400 text-sm">Betal kun for analysene du trenger, når du trenger dem - ingen månedlige bindinger.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Check className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Potensielle millionbesparelser</h4>
                  <p className="text-gray-400 text-sm">Få innsikt i eiendommens skjulte potensial og unngå kostbare feilinvesteringer.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Check className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Profesjonell kvalitet</h4>
                  <p className="text-gray-400 text-sm">Alle analyser utføres med samme høye kvalitet som våre profesjonelle kunder får.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Check className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Del med familien</h4>
                  <p className="text-gray-400 text-sm">Analyser og kreditter kan deles med familiemedlemmer for felles vurdering.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sammenligning med tradisjonelle løsninger */}
          <div className="rounded-xl overflow-hidden mb-12">
            <div className="bg-blue-900/30 border-b border-blue-500/30 p-4">
              <h3 className="text-xl font-bold text-white">Pay-As-You-Go vs. Tradisjonelle rådgivere</h3>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 border-t-0 rounded-b-xl">
              <div className="grid grid-cols-3 border-b border-gray-800">
                <div className="p-4 border-r border-gray-800">
                  <h4 className="text-white font-medium">Funksjon</h4>
                </div>
                <div className="p-4 border-r border-gray-800">
                  <h4 className="text-white font-medium">Eiendomsmuligheter Platform</h4>
                </div>
                <div className="p-4">
                  <h4 className="text-white font-medium">Tradisjonell rådgiver</h4>
                </div>
              </div>
              
              <div className="grid grid-cols-3 border-b border-gray-800">
                <div className="p-4 border-r border-gray-800 text-gray-300">
                  Kostnad
                </div>
                <div className="p-4 border-r border-gray-800 text-green-400">
                  Fra 995 kr per analyse
                </div>
                <div className="p-4 text-amber-400">
                  15.000 - 50.000+ kr
                </div>
              </div>
              
              <div className="grid grid-cols-3 border-b border-gray-800">
                <div className="p-4 border-r border-gray-800 text-gray-300">
                  Leveringstid
                </div>
                <div className="p-4 border-r border-gray-800 text-green-400">
                  24-48 timer
                </div>
                <div className="p-4 text-amber-400">
                  1-4 uker
                </div>
              </div>
              
              <div className="grid grid-cols-3 border-b border-gray-800">
                <div className="p-4 border-r border-gray-800 text-gray-300">
                  Datagrunnlag
                </div>
                <div className="p-4 border-r border-gray-800 text-green-400">
                  AI-drevet dataanalyse og offentlige kilder
                </div>
                <div className="p-4 text-amber-400">
                  Manuell gjennomgang
                </div>
              </div>
              
              <div className="grid grid-cols-3 border-b border-gray-800">
                <div className="p-4 border-r border-gray-800 text-gray-300">
                  Visualisering
                </div>
                <div className="p-4 border-r border-gray-800 text-green-400">
                  3D-modeller og fotorealistiske render
                </div>
                <div className="p-4 text-amber-400">
                  Varierende, ofte skisser
                </div>
              </div>
              
              <div className="grid grid-cols-3">
                <div className="p-4 border-r border-gray-800 text-gray-300">
                  Tilgjengelighet
                </div>
                <div className="p-4 border-r border-gray-800 text-green-400">
                  24/7 gjennom plattformen
                </div>
                <div className="p-4 text-amber-400">
                  Begrenset til kontortid
                </div>
              </div>
            </div>
          </div>
          
          {/* Kundehistorier */}
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-white mb-6">Kunder som har spart ved bruk av analysene</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                  <p className="text-lg text-blue-400 font-bold">TM</p>
                </div>
                <h4 className="text-lg font-medium text-white">Thomas Myhre</h4>
                <p className="text-sm text-gray-400">Boligeier i Oslo</p>
              </div>
              <p className="text-gray-300 text-sm">
                "Kjøpte en Premium Vurdering før vi bestemte oss for å bygge på. Analysen avdekket at vi kunne bygge 60% større tilbygg enn vi trodde. Dette ga oss 50 ekstra kvadratmeter og økte boligverdien med over 2 millioner!"
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                  <p className="text-lg text-blue-400 font-bold">KL</p>
                </div>
                <h4 className="text-lg font-medium text-white">Kari Larsen</h4>
                <p className="text-sm text-gray-400">Familiefar i Bergen</p>
              </div>
              <p className="text-gray-300 text-sm">
                "Kjøpte familiepakken og analyserte både vårt eget hus og hyttetomten vi vurderte å kjøpe. Avdekket at hyttetomten hadde betydelige byggerestriksjoner som selger ikke hadde opplyst om. Sparte oss for en kostbar feilinvestering."
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                  <p className="text-lg text-blue-400 font-bold">OB</p>
                </div>
                <h4 className="text-lg font-medium text-white">Ole Berg</h4>
                <p className="text-sm text-gray-400">Småinvestor i Trondheim</p>
              </div>
              <p className="text-gray-300 text-sm">
                "Har kjøpt 10 Basis Analyser for å screene potensielle investeringsobjekter. Fant to eiendommer med betydelig utviklingspotensial som markedet ikke hadde priset inn. Tjente over 800.000 kr på videresalg av én tomt etter reguleringsendring."
              </p>
            </div>
          </div>
          
          {/* Juridisk informasjon og ansvarsfraskrivelse */}
          <div className="text-center mb-8">
            <button 
              onClick={() => this.setShowDisclaimer(true)}
              className="flex items-center mx-auto text-gray-400 text-sm hover:text-gray-300"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Juridisk informasjon og ansvarsfraskrivelse
            </button>
            
            {this.state.showDisclaimer && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Juridisk informasjon</h3>
                    <button 
                      onClick={() => this.setShowDisclaimer(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="text-gray-300 text-sm space-y-4 mb-6">
                    <p>Eiendomsmuligheter Platform tilbyr transaksjonsbaserte analysetjenester som er ment som veiledende informasjon og beslutningsstøtte. Plattformen og dens eiere tar ikke noe juridisk ansvar for beslutninger tatt basert på den tilbudte informasjonen.</p>
                    
                    <p>Analysene er basert på tilgjengelige offentlige data, og selv om vi bestreber oss på å gi nøyaktig informasjon, kan vi ikke garantere for fullstendighet, nøyaktighet eller anvendelighet for spesifikke formål.</p>
                    
                    <p>Brukeren er selv ansvarlig for å verifisere informasjonen med relevante myndigheter og eksperthjelp før de tar viktige beslutninger om eiendomskjøp, -utvikling eller investeringer.</p>
                    
                    <p>Ved å bruke vår tjeneste, godtar du at verken Eiendomsmuligheter Platform eller dets eiere, ansatte, agenter eller partnere er ansvarlige for direkte, indirekte, tilfeldige, følgeskader eller spesielle skader som måtte oppstå som følge av bruk av plattformen eller informasjonen som tilbys.</p>
                    
                    <p>Eiendomsmuligheter Platform er ikke et finansielt rådgivningsfirma, eiendomsmeglerfirma, advokatfirma, arkitektkontor eller byggteknisk konsulentfirma, og gir ingen profesjonelle råd innenfor disse feltene. Våre analyser erstatter ikke profesjonell rådgivning.</p>
                  </div>
                  
                  <button 
                    onClick={() => this.setShowDisclaimer(false)}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium text-white"
                  >
                    Jeg forstår
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Vanlige spørsmål */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Vanlige spørsmål</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-2">Hva er forskjellen mellom analysepakkene?</h4>
                <p className="text-gray-300 text-sm">
                  Basis Analyse gir deg en grunnleggende vurdering av eiendommens byggemuligheter og reguleringsstatus. Utviklingspakken inkluderer 3D-visualisering og økonomisk analyse. Premium Vurdering inkluderer fotorealistisk modellering og detaljerte anbefalinger fra våre eksperter.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-2">Hvor lang tid tar analysene?</h4>
                <p className="text-gray-300 text-sm">
                  Basis Analyse leveres normalt innen 24 timer. Utviklingspakken tar 2-3 arbeidsdager. Premium Vurdering leveres innen 5 arbeidsdager. Ved høy etterspørsel kan leveringstiden bli noe lengre, men du vil alltid få informasjon om forventet leveringstid.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-2">Hvor lenge har jeg tilgang til analysene?</h4>
                <p className="text-gray-300 text-sm">
                  Basis Analyse gir tilgang i 1 måned, Utviklingspakken i 3 måneder og Premium Vurdering gir ubegrenset tilgang. Alle kredittbunter har ubegrenset gyldighetstid, og du kan bruke dem når det passer deg.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-2">Kan jeg oppgradere analysen?</h4>
                <p className="text-gray-300 text-sm">
                  Ja, du kan når som helst oppgradere fra Basis Analyse til Utviklingspakke eller Premium Vurdering. Du betaler da bare differansen mellom pakkene. Har du kreditter, kan disse også brukes til å finansiere oppgraderingen.
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA-avsnitt */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Klar til å oppdage eiendommens potensial?</h3>
            <p className="text-white text-lg max-w-2xl mx-auto mb-6">
              Start med en Basis Analyse i dag og få verdifull innsikt som kan spare deg for hundretusener av kroner i fremtiden.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white rounded-lg text-purple-700 font-medium"
            >
              Start analysen din nå
            </motion.button>
          </div>
        </div>
    </div>
  );
  }
} 