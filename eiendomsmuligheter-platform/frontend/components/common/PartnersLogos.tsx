import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type Partner = {
  id: string;
  name: string;
  logo: string;
  url: string;
};

interface PartnersLogosProps {
  partners: Partner[];
  className?: string;
  title?: string;
}

export const PartnersLogos: React.FC<PartnersLogosProps> = ({ 
  partners, 
  className = '',
  title = 'Våre partnere'
}) => {
  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <div className={`py-10 border-t border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h3 className="text-lg font-medium text-center text-gray-400 mb-8">{title}</h3>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {partners.map((partner) => (
            <motion.a
              key={partner.id}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-16 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

// Eksempel på bruk:
// 
// const examplePartners = [
//   {
//     id: '1',
//     name: 'DNB',
//     logo: '/logos/dnb.svg',
//     url: 'https://www.dnb.no'
//   },
//   {
//     id: '2',
//     name: 'Nordea',
//     logo: '/logos/nordea.svg',
//     url: 'https://www.nordea.no'
//   },
//   {
//     id: '3',
//     name: 'Gjensidige',
//     logo: '/logos/gjensidige.svg',
//     url: 'https://www.gjensidige.no'
//   }
// ];
// 
// <PartnersLogos partners={examplePartners} title="Våre bankpartnere" />

// Automatisk partnervisning basert på type
export const getPartnersByType = (type: 'bank' | 'insurance' | 'contractor' | 'all' = 'all'): Partner[] => {
  // I en ekte applikasjon ville vi hente dette fra en API eller kontekst
  // Dette er bare demoinformasjon
  const allPartners: { [key: string]: Partner[] } = {
    bank: [
      { id: 'dnb', name: 'DNB', logo: '/logos/dnb.svg', url: 'https://www.dnb.no' },
      { id: 'nordea', name: 'Nordea', logo: '/logos/nordea.svg', url: 'https://www.nordea.no' },
      { id: 'sparebank1', name: 'SpareBank 1', logo: '/logos/sparebank1.svg', url: 'https://www.sparebank1.no' }
    ],
    insurance: [
      { id: 'gjensidige', name: 'Gjensidige', logo: '/logos/gjensidige.svg', url: 'https://www.gjensidige.no' },
      { id: 'if', name: 'If', logo: '/logos/if.svg', url: 'https://www.if.no' },
      { id: 'tryg', name: 'Tryg', logo: '/logos/tryg.svg', url: 'https://www.tryg.no' }
    ],
    contractor: [
      { id: 'veidekke', name: 'Veidekke', logo: '/logos/veidekke.svg', url: 'https://www.veidekke.no' },
      { id: 'skanska', name: 'Skanska', logo: '/logos/skanska.svg', url: 'https://www.skanska.no' },
      { id: 'ncc', name: 'NCC', logo: '/logos/ncc.svg', url: 'https://www.ncc.no' }
    ]
  };
  
  if (type === 'all') {
    return [
      ...allPartners.bank,
      ...allPartners.insurance,
      ...allPartners.contractor
    ];
  }
  
  return allPartners[type] || [];
}; 