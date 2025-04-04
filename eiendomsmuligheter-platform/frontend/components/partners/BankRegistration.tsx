import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Building, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

// Midlertidig Switch-komponent
const Switch = ({ id, checked, onCheckedChange }) => (
  <div 
    onClick={onCheckedChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-blue-600' : 'bg-gray-700'
    } cursor-pointer`}
  >
    <span 
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} 
    />
    <input type="checkbox" id={id} className="sr-only" checked={checked} readOnly />
  </div>
);

// Midlertidig Label-komponent
const Label = ({ htmlFor, children, className = '' }) => (
  <label 
    htmlFor={htmlFor} 
    className={`block text-sm font-medium text-gray-300 ${className}`}
  >
    {children}
  </label>
);

// Ny partner-registrering for banker med pay-as-you-go modell
export const BankRegistration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    orgNumber: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    logo: null,
    website: '',
    description: '',
    coverageAreas: [],
    leadPreferences: {
      newMortgage: true,
      refinancing: true,
      equity: false,
      construction: false,
    },
    pricePerLead: 550,
    maxLeadsPerDay: 5,
    maxLeadsPerMonth: 100,
    acceptTerms: false,
    apiIntegration: false,
    whiteLabel: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLeadPreferenceChange = (key) => {
    setFormData(prevData => ({
      ...prevData,
      leadPreferences: {
        ...prevData.leadPreferences,
        [key]: !prevData.leadPreferences[key]
      }
    }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prevData => ({
        ...prevData,
        logo: e.target.files[0]
      }));
    }
  };

  const nextStep = () => setStep(prevStep => prevStep + 1);
  const prevStep = () => setStep(prevStep => prevStep - 1);

  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block p-3 bg-blue-600/10 rounded-full mb-4">
          <Building className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Bli en Bank Partner</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Få tilgang til kvalifiserte leads for boliglån og skreddersy din pay-as-you-go partnerpakke
        </p>
      </div>

      {/* Stegindikator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= i ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <span className="text-white text-sm">{i}</span>
            </div>
            {i < 3 && (
              <div className={`w-16 h-1 ${step > i ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Steg 1: Grunnleggende informasjon */}
      {step === 1 && (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Bankens informasjon</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="companyName">Banknavn</Label>
              <Input 
                id="companyName" 
                name="companyName" 
                placeholder="f.eks. Nordea Bank"
                value={formData.companyName}
                onChange={handleChange}
                className="bg-black/40 border-gray-700 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="orgNumber">Organisasjonsnummer</Label>
              <Input 
                id="orgNumber" 
                name="orgNumber" 
                placeholder="9 siffer"
                value={formData.orgNumber}
                onChange={handleChange}
                className="bg-black/40 border-gray-700 mt-1"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="address">Adresse</Label>
            <Input 
              id="address" 
              name="address" 
              placeholder="Gateadresse, postnummer, by"
              value={formData.address}
              onChange={handleChange}
              className="bg-black/40 border-gray-700 mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="contactPerson">Kontaktperson</Label>
              <Input 
                id="contactPerson" 
                name="contactPerson" 
                placeholder="Fullt navn"
                value={formData.contactPerson}
                onChange={handleChange}
                className="bg-black/40 border-gray-700 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                placeholder="kontakt@bank.no"
                value={formData.email}
                onChange={handleChange}
                className="bg-black/40 border-gray-700 mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                name="phone" 
                placeholder="+47 xxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
                className="bg-black/40 border-gray-700 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="website">Nettside</Label>
              <Input 
                id="website" 
                name="website" 
                placeholder="https://www.bank.no"
                value={formData.website}
                onChange={handleChange}
                className="bg-black/40 border-gray-700 mt-1"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="description">Kort beskrivelse av banken</Label>
            <TextArea
              id="description"
              name="description"
              placeholder="Beskriv bankens tilbud og spesialiteter..."
              value={formData.description}
              onChange={handleChange}
              className="bg-black/40 border-gray-700 mt-1 h-24"
            />
          </div>
          
          <div className="mb-6">
            <Label htmlFor="logo">Bankens logo</Label>
            <Input 
              id="logo" 
              type="file" 
              accept="image/*"
              onChange={handleLogoChange}
              className="bg-black/40 border-gray-700 mt-1"
            />
            <p className="text-xs text-gray-400 mt-1">Anbefalt: SVG eller PNG med transparent bakgrunn.</p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Neste steg
            </Button>
          </div>
        </div>
      )}

      {/* Steg 2: Lead-preferanser */}
      {step === 2 && (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Lead-preferanser og Pay-As-You-Go innstillinger</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Typer leads du ønsker å motta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Switch 
                  id="newMortgage"
                  checked={formData.leadPreferences.newMortgage}
                  onCheckedChange={() => handleLeadPreferenceChange('newMortgage')}
                />
                <Label htmlFor="newMortgage">Nye boliglån</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch 
                  id="refinancing"
                  checked={formData.leadPreferences.refinancing}
                  onCheckedChange={() => handleLeadPreferenceChange('refinancing')}
                />
                <Label htmlFor="refinancing">Refinansiering</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch 
                  id="equity"
                  checked={formData.leadPreferences.equity}
                  onCheckedChange={() => handleLeadPreferenceChange('equity')}
                />
                <Label htmlFor="equity">Egenkapitallån</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch 
                  id="construction"
                  checked={formData.leadPreferences.construction}
                  onCheckedChange={() => handleLeadPreferenceChange('construction')}
                />
                <Label htmlFor="construction">Byggelån</Label>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-3">Pay-As-You-Go innstillinger</h3>
            <div className="mb-4">
              <Label htmlFor="pricePerLead">Pris per lead (kr)</Label>
              <Input 
                id="pricePerLead" 
                name="pricePerLead" 
                type="number"
                value={formData.pricePerLead}
                onChange={handleChange}
                className="bg-black/40 border-gray-700 mt-1 w-full md:w-1/3"
              />
              <p className="text-xs text-gray-400 mt-1">Standard pris per lead er 550 kr. Du kan justere dette basert på kvalitetskrav.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="maxLeadsPerDay">Maksimalt antall leads per dag</Label>
                <Input 
                  id="maxLeadsPerDay" 
                  name="maxLeadsPerDay" 
                  type="number"
                  value={formData.maxLeadsPerDay}
                  onChange={handleChange}
                  className="bg-black/40 border-gray-700 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxLeadsPerMonth">Maksimalt antall leads per måned</Label>
                <Input 
                  id="maxLeadsPerMonth" 
                  name="maxLeadsPerMonth" 
                  type="number"
                  value={formData.maxLeadsPerMonth}
                  onChange={handleChange}
                  className="bg-black/40 border-gray-700 mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="flex items-center text-blue-400 font-medium mb-2">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Fordeler med Pay-As-You-Go modellen
            </h3>
            <ul className="text-gray-300 space-y-2 pl-7 list-disc">
              <li>Ingen månedsavgift eller faste kostnader</li>
              <li>Betal kun for faktiske, kvalifiserte leads</li>
              <li>Full kontroll over lead-volum og budsjett</li>
              <li>Avvisningsrett for leads som ikke møter kvalitetskrav</li>
              <li>Detaljert statistikk og ROI-rapportering</li>
            </ul>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              onClick={prevStep}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Tilbake
            </Button>
            <Button 
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Neste steg
            </Button>
          </div>
        </div>
      )}
      
      {/* Steg 3: Tilleggstjenester og bekreftelse */}
      {step === 3 && (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Tilleggstjenester og bekreftelse</h2>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-3">Tilleggstjenester</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border border-gray-800 rounded-lg">
                <Switch 
                  id="apiIntegration"
                  checked={formData.apiIntegration}
                  onCheckedChange={() => setFormData(prev => ({...prev, apiIntegration: !prev.apiIntegration}))}
                />
                <div>
                  <Label htmlFor="apiIntegration" className="font-medium">API-integrasjon</Label>
                  <p className="text-sm text-gray-400">Integrer leads direkte i ditt CRM-system via vår API. Engangsavgift på 14.950 kr.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 border border-gray-800 rounded-lg">
                <Switch 
                  id="whiteLabel"
                  checked={formData.whiteLabel}
                  onCheckedChange={() => setFormData(prev => ({...prev, whiteLabel: !prev.whiteLabel}))}
                />
                <div>
                  <Label htmlFor="whiteLabel" className="font-medium">White-label rapporter</Label>
                  <p className="text-sm text-gray-400">Få tilpassede rapporter med din logo og merkevare. Engangsavgift på 9.950 kr.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-4 border border-red-900/30 bg-red-900/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white">Viktig juridisk informasjon</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Ved å registrere deg som partner godtar du at leads kjøpes på "som de er"-basis. Eiendomsmuligheter Platform garanterer ikke konverteringsrate eller kvalitet utover definerte minimumskriterier. Leads som ikke oppfyller disse kriteriene kan avvises innen 24 timer, og du vil da ikke bli belastet.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <Switch 
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={() => setFormData(prev => ({...prev, acceptTerms: !prev.acceptTerms}))}
              />
              <Label htmlFor="acceptTerms">
                Jeg godtar <span className="text-blue-400 underline cursor-pointer">vilkårene og betingelsene</span> for partnerskap
              </Label>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Sammendrag av Pay-As-You-Go partnerskap</h3>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                <FileText className="h-3.5 w-3.5" />
                Last ned kontraktutkast
              </Button>
            </div>
            
            <div className="space-y-2 text-gray-300 text-sm mb-6">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span>Pris per lead:</span>
                <span className="font-medium text-white">{formData.pricePerLead} kr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span>Maksimalt antall leads per dag:</span>
                <span className="font-medium text-white">{formData.maxLeadsPerDay}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span>Maksimalt antall leads per måned:</span>
                <span className="font-medium text-white">{formData.maxLeadsPerMonth}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span>API-integrasjon:</span>
                <span className="font-medium text-white">{formData.apiIntegration ? 'Ja (14.950 kr)' : 'Nei'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span>White-label rapporter:</span>
                <span className="font-medium text-white">{formData.whiteLabel ? 'Ja (9.950 kr)' : 'Nei'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span>Potensielt maksimalt månedlig beløp:</span>
                <span className="font-medium text-white">{formData.pricePerLead * formData.maxLeadsPerMonth} kr</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              onClick={prevStep}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Tilbake
            </Button>
            <Button 
              disabled={!formData.acceptTerms}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fullfør registrering
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-400">
        Har du spørsmål om partnerskap? <span className="text-blue-400 cursor-pointer">Kontakt oss</span>
      </div>
    </div>
  );
}; 