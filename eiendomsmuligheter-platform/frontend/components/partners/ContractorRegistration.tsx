import React, { useState } from 'react';
import { Hammer, FileText, MapPin, BarChart, CheckCircle2, AlertTriangle } from 'lucide-react';

// Pay-as-you-go entreprenørregistrering
export const ContractorRegistration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Firmainformasjon
    companyName: '',
      orgNumber: '',
      address: '',
    zipCode: '',
      city: '',
    contactName: '',
    phone: '',
    email: '',
      website: '',
    logo: null,
    
    // Tjenesteinformasjon
    companyType: 'builder', // builder, architect, interior, etc.
    services: [],
    serviceAreas: [],
    employeeCount: '',
      description: '',
    images: [],
    references: [],
    
    // Pay-as-you-go-innstillinger
    leadPreferences: {
      newBuilding: true,
      renovation: true,
      extension: true,
      interior: false,
      commercial: false
    },
    pricePerLead: 450,
    maxLeadsPerDay: 3,
    maxLeadsPerMonth: 40,
    minimumProjectSize: 100000, // kr
    
    // Tilleggstjenester
    apiIntegration: false,
    featuredListing: false,
    profileHighlight: false,
    
    acceptTerms: false
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

  const handleFileChange = (e, field) => {
    if (e.target.files.length) {
      if (field === 'images') {
        setFormData(prevData => ({
          ...prevData,
          images: [...prevData.images, ...Array.from(e.target.files)]
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          [field]: e.target.files[0]
        }));
      }
    }
  };

  const handleServiceChange = (service) => {
    const updatedServices = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    
    setFormData(prevData => ({
      ...prevData,
      services: updatedServices
    }));
  };

  const addServiceArea = (area) => {
    if (area && !formData.serviceAreas.includes(area)) {
      setFormData(prevData => ({
        ...prevData,
        serviceAreas: [...prevData.serviceAreas, area]
      }));
    }
  };

  const removeServiceArea = (area) => {
    setFormData(prevData => ({
      ...prevData,
      serviceAreas: prevData.serviceAreas.filter(a => a !== area)
    }));
  };

  const nextStep = () => {
    setStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
  };

        return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block p-3 bg-blue-600/10 rounded-full mb-4">
          <Hammer className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Bli en Entreprenør Partner</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Få tilgang til kvalifiserte leads og betal kun for faktiske prosjektmuligheter med vår Pay-As-You-Go modell
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

      {/* Steg 1: Firmainformasjon */}
      {step === 1 && (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Firmainformasjon</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-300 mb-2">Firmanavn</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                placeholder="f.eks. Bygg AS"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Organisasjonsnummer</label>
              <input
                type="text"
                name="orgNumber"
                value={formData.orgNumber}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                placeholder="9 siffer"
              />
            </div>
            </div>
            
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Adresse</label>
              <input
                type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Gateadresse"
              />
            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
              <label className="block text-gray-300 mb-2">Postnummer</label>
                <input
                  type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Postnr."
                />
              </div>
            <div className="md:col-span-2">
              <label className="block text-gray-300 mb-2">Sted</label>
                <input
                  type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                placeholder="By/sted"
                />
              </div>
            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-300 mb-2">Kontaktperson</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Fullt navn"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">E-post</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                placeholder="kontakt@firma.no"
              />
            </div>
            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-300 mb-2">Telefon</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                placeholder="+47 xxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Nettside</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                placeholder="https://www.firma.no"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Firmalogo</label>
            <div className="border border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Hammer className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-gray-300">Klikk for å laste opp logo</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG eller SVG (maks 2MB)</p>
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700"
            >
              Neste steg
            </button>
          </div>
        </div>
      )}

      {/* Steg 2: Tjenesteinformasjon */}
      {step === 2 && (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Tjenesteinformasjon</h2>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Type firma</label>
            <select
              name="companyType"
              value={formData.companyType}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="builder">Entreprenør/byggefirma</option>
              <option value="architect">Arkitekt</option>
              <option value="interior">Interiørarkitekt</option>
              <option value="consultant">Byggteknisk konsulent</option>
              <option value="electrician">Elektriker</option>
              <option value="plumber">Rørlegger</option>
              <option value="painter">Maler</option>
              <option value="carpenter">Snekker/tømrer</option>
              <option value="landscape">Landskapsarkitekt/anleggsgartner</option>
              <option value="other">Annet</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Tjenester dere tilbyr</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Nybygg', 'Tilbygg', 'Oppussing', 'Rehabilitering', 'Interiør',
                'Kjøkken', 'Bad', 'Utendørs', 'Grunnarbeid', 'Prosjektledelse',
                'Taktekking', 'Fasadearbeid', 'Betongarbeid', 'Trearbeid', 'Maling'
              ].map(service => (
                <label key={service} className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="checkbox"
                    checked={formData.services.includes(service)}
                    onChange={() => handleServiceChange(service)}
                      className="mr-2"
                    />
                  <span className="text-gray-300">{service}</span>
                  </label>
                ))}
              </div>
            </div>
            
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Geografiske områder dere dekker</label>
            <div className="mb-3 flex items-center">
              <input 
                type="text"
                placeholder="Legg til kommune eller fylke"
                className="flex-grow p-3 rounded-l-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                id="serviceAreaInput"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('serviceAreaInput') as HTMLInputElement;
                  addServiceArea(input.value);
                  input.value = '';
                }}
                className="px-4 py-3 rounded-r-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.serviceAreas.map(area => (
                <div key={area} className="flex items-center bg-blue-900/30 border border-blue-700/30 rounded-full px-3 py-1">
                  <span className="text-sm text-gray-300 mr-2">{area}</span>
                  <button 
                    onClick={() => removeServiceArea(area)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                ))}
              </div>
            </div>
            
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Antall ansatte</label>
            <select
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Velg antall</option>
              <option value="1-5">1-5 ansatte</option>
              <option value="6-10">6-10 ansatte</option>
              <option value="11-25">11-25 ansatte</option>
              <option value="26-50">26-50 ansatte</option>
              <option value="51-100">51-100 ansatte</option>
              <option value="100+">Over 100 ansatte</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Kort beskrivelse av firmaet</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
              placeholder="Beskriv firmaets spesialiteter og erfaring..."
              rows={4}
              />
            </div>
            
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800"
            >
              Tilbake
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700"
            >
              Neste steg
            </button>
          </div>
        </div>
      )}

      {/* Steg 3: Pay-As-You-Go og tilleggstjenester */}
      {step === 3 && (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Pay-As-You-Go innstillinger</h2>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-3">Typer leads du ønsker å motta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input 
                  type="checkbox"
                  checked={formData.leadPreferences.newBuilding}
                  onChange={() => handleLeadPreferenceChange('newBuilding')}
                  className="mr-2"
                />
                <span className="text-gray-300">Nybygg</span>
              </label>
              <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input 
                  type="checkbox"
                  checked={formData.leadPreferences.renovation}
                  onChange={() => handleLeadPreferenceChange('renovation')}
                  className="mr-2"
                />
                <span className="text-gray-300">Oppussing/rehabilitering</span>
              </label>
              <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input 
                  type="checkbox"
                  checked={formData.leadPreferences.extension}
                  onChange={() => handleLeadPreferenceChange('extension')}
                  className="mr-2"
                />
                <span className="text-gray-300">Tilbygg/påbygg</span>
              </label>
              <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input 
                  type="checkbox"
                  checked={formData.leadPreferences.interior}
                  onChange={() => handleLeadPreferenceChange('interior')}
                  className="mr-2"
                />
                <span className="text-gray-300">Interiørprosjekter</span>
              </label>
              <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="checkbox"
                  checked={formData.leadPreferences.commercial}
                  onChange={() => handleLeadPreferenceChange('commercial')}
                      className="mr-2"
                    />
                <span className="text-gray-300">Næringsbygg</span>
                  </label>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Prisinnstillinger</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-gray-300 mb-2">Pris per lead (kr)</label>
                <input 
                  type="number"
                  name="pricePerLead"
                  value={formData.pricePerLead}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Standard pris er 450 kr per kvalifisert lead</p>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Minimum prosjektstørrelse (kr)</label>
                <input 
                  type="number"
                  name="minimumProjectSize"
                  value={formData.minimumProjectSize}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Vi vil kun sende leads for prosjekter over denne verdien</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-gray-300 mb-2">Maks leads per dag</label>
                <input 
                  type="number"
                  name="maxLeadsPerDay"
                  value={formData.maxLeadsPerDay}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-2">Maks leads per måned</label>
                <input 
                  type="number"
                  name="maxLeadsPerMonth"
                  value={formData.maxLeadsPerMonth}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
            <h3 className="flex items-center text-blue-400 font-medium mb-2">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Fordeler med Pay-As-You-Go modellen
            </h3>
            <ul className="text-gray-300 space-y-2 pl-7 list-disc">
              <li>Ingen månedlige abonnementsavgifter eller oppstartskostnader</li>
              <li>Du betaler kun for kvalifiserte leads som passer din profil</li>
              <li>Full kontroll over budsjett og leadvolum</li>
              <li>Målretting basert på geografi, prosjekttype og størrelse</li>
              <li>Avvisningsrett for ukvalifiserte leads innen 24 timer</li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-3">Tilleggstjenester</h3>
            
            <div className="space-y-4">
              <label className="flex items-start space-x-3 p-4 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input 
                  type="checkbox"
                  name="apiIntegration"
                  checked={formData.apiIntegration}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-white">API-integrasjon</div>
                  <p className="text-sm text-gray-400">Integrer leads direkte i ditt CRM-system. Engangsavgift på 9.950 kr.</p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input 
                  type="checkbox"
                  name="featuredListing"
                  checked={formData.featuredListing}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-white">Fremhevet listing</div>
                  <p className="text-sm text-gray-400">Vis ditt firma øverst i søkeresultater i ditt område. 2.950 kr per måned.</p>
              </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="checkbox"
                  name="profileHighlight"
                  checked={formData.profileHighlight}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-white">Profilhøydepunkter</div>
                  <p className="text-sm text-gray-400">Legg til bildegallerier, kundeanmeldelser og flere detaljer. 1.950 kr per måned.</p>
                </div>
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-4 border border-red-900/30 bg-red-900/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white">Viktig juridisk informasjon</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Ved å registrere deg som partner godtar du at leads kjøpes på "som de er"-basis. Eiendomsmuligheter Platform garanterer ikke konverteringsrate eller kvalitet utover definerte minimumskriterier. Leads som ikke oppfyller disse kriteriene kan avvises innen 24 timer.
                </p>
              </div>
            </div>
            </div>
            
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-300">
                Jeg godtar <span className="text-blue-400 underline cursor-pointer">vilkårene og betingelsene</span> for partnerskap
              </span>
            </label>
          </div>
          
          <div className="border-t border-gray-800 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Sammendrag</h3>
              <button className="px-3 py-1 rounded text-xs flex items-center gap-1 text-gray-300 border border-gray-700 hover:bg-gray-800">
                <FileText className="h-3.5 w-3.5" />
                Last ned avtale
              </button>
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
                <span>Minimum prosjektstørrelse:</span>
                <span className="font-medium text-white">{formData.minimumProjectSize.toLocaleString()} kr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span>Potensielt maksimalt månedlig beløp:</span>
                <span className="font-medium text-white">{(formData.pricePerLead * formData.maxLeadsPerMonth).toLocaleString()} kr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span>Tilleggstjenester:</span>
                <span className="font-medium text-white">
                  {[
                    formData.apiIntegration && 'API-integrasjon',
                    formData.featuredListing && 'Fremhevet listing',
                    formData.profileHighlight && 'Profilhøydepunkter'
                  ].filter(Boolean).join(', ') || 'Ingen'}
              </span>
              </div>
            </div>
      </div>
      
      <div className="flex justify-between mt-8">
          <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800"
          >
            Tilbake
          </button>
          <button
              disabled={!formData.acceptTerms}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                formData.acceptTerms
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              Registrer partnerskap
          </button>
          </div>
        </div>
      )}
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          Har du spørsmål om partnerskapet? <span className="text-blue-400 cursor-pointer">Kontakt oss</span>
        </p>
      </div>
      
      {/* Statistikk-visning */}
      <div className="mt-12 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Entreprenører tjener i gjennomsnitt med Pay-As-You-Go</h3>
          <BarChart className="h-5 w-5 text-blue-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">28%</div>
            <div className="text-sm text-gray-400">høyere konverteringsrate</div>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">320k</div>
            <div className="text-sm text-gray-400">gjennomsnittlig prosjektverdi</div>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">4.8x</div>
            <div className="text-sm text-gray-400">ROI på lead-kostnad</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 