"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, Building, ShieldCheck, CreditCard, MapPin, Phone, Mail, Globe, CheckCircle, Calendar, Clock, Users, Star } from 'lucide-react';

// Dummy partnerdata - skulle normalt hentes fra backend
const partnersData = [
  // Banker
  {
    id: '1',
    name: 'DNB Eiendom',
    type: 'bank',
    logo: '/images/partners/dnb.svg',
    description: 'Norges største bank med spesialtilbud på boliglån for våre brukere.',
    longDescription: 'DNB er Norges største finanskonsern og en av Nordens største finansinstitusjoner målt etter markedsverdi. Konsernet tilbyr et komplett utvalg av finansielle tjenester, inkludert lån, sparing, rådgivning, forsikring og pensjon for personkunder og bedrifter. Vi har et spesielt fokus på finansieringsløsninger for bolig og eiendomsutvikling.',
    services: ['Boliglån', 'Refinansiering', 'Verdivurdering'],
    contactInfo: {
      address: 'Dronning Eufemias gate 30, 0191 Oslo',
      phone: '+47 915 04800',
      email: 'kundeservice@dnb.no',
      website: 'https://www.dnb.no'
    },
    openingHours: [
      { day: 'Mandag-Fredag', hours: '08:00-16:00' },
      { day: 'Lørdag-Søndag', hours: 'Stengt' }
    ],
    benefits: [
      'Spesialrabatt på boliglån for Eiendomsmuligheter-kunder',
      'Dedikert rådgiver for eiendomsprosjekter',
      'Rask behandlingstid for lånesøknader',
      'Gratis verdivurdering ved finansiering gjennom DNB'
    ],
    testimonials: [
      {
        author: 'Karl Johansen',
        role: 'Boligkunde',
        text: 'DNB ga meg et konkurransedyktig boliglån med betingelser som passet perfekt til mitt byggeprosjekt.'
      },
      {
        author: 'Marte Pedersen',
        role: 'Eiendomsutvikler',
        text: 'Som eiendomsutvikler trenger jeg en bank som forstår kompleksiteten i prosjektene våre. DNB har vist seg å være en pålitelig partner.'
      }
    ],
    stats: [
      { label: 'Behandlingstid lånesøknad', value: '3-5 dager' },
      { label: 'Gjennomsnittlig rente', value: '3.2%' },
      { label: 'Kundetilfredshet', value: '4.7/5' }
    ],
    featured: true
  },
  // Flere partnere følger samme mønster
  {
    id: '4',
    name: 'Gjensidige',
    type: 'insurance',
    logo: '/images/partners/gjensidige.svg',
    description: 'Omfattende forsikringsløsninger for byggeprosjekter og boliger.',
    longDescription: 'Gjensidige er et ledende forsikringsselskap i Norden med røtter tilbake til 1800-tallet. Vi tilbyr trygghet gjennom et bredt spekter av forsikringsprodukter for privatpersoner og bedrifter. Vår spesialkompetanse innen byggskadeforsikring og boligforsikring gjør oss til en ideell partner for eiendomsutviklere og boligeiere.',
    services: ['Byggskadeforsikring', 'Boligforsikring', 'Prosjektforsikring'],
    contactInfo: {
      address: 'Schweigaards gate 21, 0191 Oslo',
      phone: '+47 915 03100',
      email: 'kundeservice@gjensidige.no',
      website: 'https://www.gjensidige.no'
    },
    openingHours: [
      { day: 'Mandag-Fredag', hours: '08:00-16:00' },
      { day: 'Lørdag', hours: '10:00-14:00' },
      { day: 'Søndag', hours: 'Stengt' }
    ],
    benefits: [
      'Spesialtilpassede forsikringsløsninger for eiendomsprosjekter',
      '15% rabatt på byggskadeforsikring',
      'Rask og effektiv skadebehandling',
      'Gratis risikovurdering for større prosjekter'
    ],
    testimonials: [
      {
        author: 'Anders Nilsen',
        role: 'Prosjektleder',
        text: 'Gjensidige har vært en uvurderlig partner i våre byggeprosjekter. Deres ekspertise har hjulpet oss å unngå flere potensielle problemer.'
      }
    ],
    stats: [
      { label: 'Utbetalingstid skade', value: '3-7 dager' },
      { label: 'Kundetilfredshet', value: '4.8/5' },
      { label: 'Markedsandel byggskadeforsikring', value: '34%' }
    ],
    featured: true
  },
  {
    id: '6',
    name: 'PEAB',
    type: 'contractor',
    logo: '/images/partners/peab.svg',
    description: 'Erfaren entreprenør med fokus på bærekraftige byggeløsninger.',
    longDescription: 'PEAB er et av Nordens ledende entreprenørselskap med virksomhet innen bygg, anlegg, industri og eiendomsutvikling. Med over 50 års erfaring leverer vi innovative og bærekraftige løsninger for både små og store prosjekter. Vår styrke ligger i lokal tilstedeværelse kombinert med stordriftsfordeler.',
    services: ['Boligutvikling', 'Rehabilitering', 'Byggeledelse'],
    contactInfo: {
      address: 'Sørkedalsveien 150 A, 0754 Oslo',
      phone: '+47 22 40 30 00',
      email: 'info@peab.no',
      website: 'https://www.peab.no'
    },
    openingHours: [
      { day: 'Mandag-Fredag', hours: '07:00-15:30' },
      { day: 'Lørdag-Søndag', hours: 'Stengt' }
    ],
    benefits: [
      'Spesialisert på energieffektive byggeløsninger',
      'Komplette løsninger fra prosjektering til ferdigstillelse',
      'Fast pris-garanti på totalentrepriser',
      'Erfaring med alle typer byggeprosjekter'
    ],
    testimonials: [
      {
        author: 'Hanne Bakken',
        role: 'Boligeier',
        text: 'PEAB gjorde en fantastisk jobb med renovering av boligen vår. Profesjonelle, punktlige og med et øye for detaljer.'
      },
      {
        author: 'Thomas Lund',
        role: 'Boligprosjektleder',
        text: 'Vi har samarbeidet med PEAB på flere store prosjekter. Deres evne til å levere kvalitet innenfor tidsrammer og budsjett er imponerende.'
      }
    ],
    stats: [
      { label: 'Antall prosjekter årlig', value: '300+' },
      { label: 'Gjennomsnittlig byggetid', value: '-10% vs bransjestandard' },
      { label: 'Kundetilfredshet', value: '4.9/5' }
    ],
    featured: true
  }
];

// Helper function to get icon for partner type
const getPartnerIcon = (type) => {
  switch (type) {
    case 'bank':
      return <CreditCard className="h-6 w-6 text-blue-400" />;
    case 'insurance':
      return <ShieldCheck className="h-6 w-6 text-green-400" />;
    case 'contractor':
      return <Building className="h-6 w-6 text-orange-400" />;
    default:
      return <Building className="h-6 w-6 text-gray-400" />;
  }
};

// Helper function to get the label for partner type
const getPartnerTypeLabel = (type) => {
  switch (type) {
    case 'bank':
      return 'Bank';
    case 'insurance':
      return 'Forsikring';
    case 'contractor':
      return 'Entreprenør';
    default:
      return 'Partner';
  }
};

// Helper function to get the color class for partner type
const getPartnerColorClass = (type) => {
  switch (type) {
    case 'bank':
      return 'from-blue-900/20 to-blue-800/10 border-blue-500/20';
    case 'insurance':
      return 'from-green-900/20 to-green-800/10 border-green-500/20';
    case 'contractor':
      return 'from-orange-900/20 to-orange-800/10 border-orange-500/20';
    default:
      return 'from-gray-900/20 to-gray-800/10 border-gray-500/20';
  }
};

export default function PartnerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  
  useEffect(() => {
    if (id) {
      // Simulerer API-kall for å hente partnerinformasjon
      setIsLoading(true);
      const fetchedPartner = partnersData.find(p => p.id === id);
      
      // Simulerer lastingstid
      setTimeout(() => {
        setPartner(fetchedPartner);
        setIsLoading(false);
      }, 500);
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Laster inn partnerinformasjon...</p>
        </div>
      </div>
    );
  }
  
  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/partners" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Tilbake til partnere
          </Link>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Partner ikke funnet</h1>
            <p className="text-gray-300 mb-6">Beklager, men partneren du leter etter ble ikke funnet.</p>
            <Link href="/partners">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                Se alle partnere
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/partners" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Tilbake til partnere
        </Link>
        
        {/* Partner header */}
        <div className={`bg-gradient-to-br ${getPartnerColorClass(partner.type)} border rounded-xl p-6 md:p-8 mb-8`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-24 w-24 bg-white rounded-xl p-3 flex items-center justify-center">
              {/* Placeholder for partner logo */}
              <div className="text-center text-gray-800 font-bold text-2xl">
                {partner.name.substring(0, 2)}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <div className="flex items-center justify-center md:justify-start">
                  {getPartnerIcon(partner.type)}
                  <span className="text-sm text-gray-300 ml-1">
                    {getPartnerTypeLabel(partner.type)}
                  </span>
                </div>
                {partner.featured && (
                  <span className="inline-flex items-center bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 mr-1" fill="currentColor" />
                    Utvalgt partner
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{partner.name}</h1>
              <p className="text-gray-300 mb-6 max-w-3xl">{partner.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {partner.services.map((service, index) => (
                  <span 
                    key={index}
                    className="text-sm bg-white/10 text-white px-3 py-1 rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex flex-wrap border-b border-white/10 mb-8">
          <button 
            onClick={() => setActiveTab('about')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'about' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Om partneren
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'services' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tjenester og fordeler
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'testimonials' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tilbakemeldinger
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'contact' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Kontaktinformasjon
          </button>
        </div>
        
        {/* About tab */}
        {activeTab === 'about' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">Om {partner.name}</h2>
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-300">{partner.longDescription}</p>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {partner.stats.map((stat, index) => (
                  <div key={index} className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-medium text-white mb-4">Kontaktinformasjon</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{partner.contactInfo.address}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a href={`tel:${partner.contactInfo.phone}`} className="text-gray-300 hover:text-white">{partner.contactInfo.phone}</a>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a href={`mailto:${partner.contactInfo.email}`} className="text-gray-300 hover:text-white">{partner.contactInfo.email}</a>
                  </div>
                  
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a href={partner.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">{partner.contactInfo.website.replace('https://', '')}</a>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Åpningstider
                  </h4>
                  <div className="space-y-2">
                    {partner.openingHours.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.day}</span>
                        <span className="text-white">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <a 
                    href={partner.contactInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-center rounded-lg text-white font-medium"
                  >
                    Besøk nettside
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Services tab */}
        {activeTab === 'services' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Tjenester og fordeler</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-xl font-medium text-white mb-4">Tjenester</h3>
                <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
                  <div className="space-y-4">
                    {partner.services.map((service, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                          partner.type === 'bank' ? 'bg-blue-500/20 text-blue-400' :
                          partner.type === 'insurance' ? 'bg-green-500/20 text-green-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-white">{service}</h4>
                          <p className="text-gray-400">Profesjonell {service.toLowerCase()} tilpasset dine behov.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-white mb-4">Fordeler for deg</h3>
                <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
                  <div className="space-y-4">
                    {partner.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                        <p className="text-gray-300">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Interessert i disse tjenestene?</h3>
                  <p className="text-gray-300">Ta kontakt med {partner.name} for å få mer informasjon og et uforpliktende tilbud.</p>
                </div>
                <div className="flex space-x-4">
                  <a 
                    href={`mailto:${partner.contactInfo.email}`}
                    className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium"
                  >
                    Send e-post
                  </a>
                  <a 
                    href={`tel:${partner.contactInfo.phone}`}
                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white text-sm font-medium"
                  >
                    Ring nå
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Testimonials tab */}
        {activeTab === 'testimonials' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Tilbakemeldinger fra kunder</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {partner.testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800/50 border border-white/10 rounded-lg p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.author.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">{testimonial.author}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.text}"</p>
                </motion.div>
              ))}
            </div>
            
            <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Del din erfaring med {partner.name}</h3>
              <p className="text-gray-400 mb-6">Har du samarbeidet med {partner.name} gjennom vår plattform? Vi ønsker gjerne å høre om din erfaring.</p>
              <button className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium">
                Skriv en tilbakemelding
              </button>
            </div>
          </div>
        )}
        
        {/* Contact tab */}
        {activeTab === 'contact' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Kontakt {partner.name}</h2>
              
              <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Adresse</p>
                      <p className="text-white">{partner.contactInfo.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Telefon</p>
                      <a href={`tel:${partner.contactInfo.phone}`} className="text-white hover:text-blue-400">{partner.contactInfo.phone}</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">E-post</p>
                      <a href={`mailto:${partner.contactInfo.email}`} className="text-white hover:text-blue-400">{partner.contactInfo.email}</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Nettside</p>
                      <a href={partner.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">{partner.contactInfo.website}</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Åpningstider
                </h3>
                <div className="space-y-3">
                  {partner.openingHours.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span className="text-gray-300">{item.day}</span>
                      <span className="text-white font-medium">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Send en henvendelse</h2>
              
              <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Navn</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ditt fulle navn"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-post</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="din.epost@eksempel.no"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Emne</label>
                    <select 
                      id="subject" 
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Velg et emne</option>
                      {partner.services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                      <option value="other">Annet</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Melding</label>
                    <textarea 
                      id="message" 
                      rows={5} 
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Skriv din henvendelse her..."
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="consent" 
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700" 
                    />
                    <label htmlFor="consent" className="ml-2 block text-sm text-gray-300">
                      Jeg godtar at informasjonen min deles med {partner.name}
                    </label>
                  </div>
                  
                  <div>
                    <button 
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-medium"
                    >
                      Send henvendelse
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 