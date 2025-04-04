import React from 'react';
import Link from 'next/link';
import { PartnersLogos, getPartnersByType } from '../common/PartnersLogos';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Shield } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const allPartners = getPartnersByType('all');
  
  return (
    <footer className="bg-gray-950 border-t border-gray-900">
      {/* Partner-seksjon */}
      <PartnersLogos 
        partners={allPartners} 
        title="Våre samarbeidspartnere" 
        className="bg-black/20"
      />
      
      {/* Hovedfooter */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Kolonne 1: Om oss */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Om Eiendomsmuligheter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Vi revolusjonerer eiendomsanalyse med AI-drevne verktøy som hjelper deg å oppdage eiendommers skjulte potensial med pay-as-you-go priser.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Kolonne 2: Raske lenker */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Raske lenker</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-blue-400 text-sm">
                  Priser og pakker
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-blue-400 text-sm">
                  Hvordan det fungerer
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-gray-400 hover:text-blue-400 text-sm">
                  Eksempler
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-blue-400 text-sm">
                  Vanlige spørsmål
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-blue-400 text-sm">
                  Logg inn
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-blue-400 text-sm">
                  Registrer deg
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Kolonne 3: For partnere */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">For partnere</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/partners/banks" className="text-gray-400 hover:text-blue-400 text-sm">
                  For banker
                </Link>
              </li>
              <li>
                <Link href="/partners/insurance" className="text-gray-400 hover:text-blue-400 text-sm">
                  For forsikringsselskaper
                </Link>
              </li>
              <li>
                <Link href="/partners/contractors" className="text-gray-400 hover:text-blue-400 text-sm">
                  For entreprenører
                </Link>
              </li>
              <li>
                <Link href="/partners/api" className="text-gray-400 hover:text-blue-400 text-sm">
                  API-dokumentasjon
                </Link>
              </li>
              <li>
                <Link href="/partners/dashboard" className="text-gray-400 hover:text-blue-400 text-sm">
                  Partner-dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Kolonne 4: Kontakt */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Kontakt oss</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm">kontakt@eiendomsmuligheter.no</span>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm">+47 22 33 44 55</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm">Storgata 1, 0155 Oslo, Norge</span>
              </li>
              <li className="flex items-start">
                <Shield className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm">Org.nr: 987 654 321</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright og juridisk */}
      <div className="border-t border-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Eiendomsmuligheter Platform AS. Alle rettigheter reservert.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-blue-400 text-sm">
              Personvern
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-blue-400 text-sm">
              Vilkår og betingelser
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-blue-400 text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}; 