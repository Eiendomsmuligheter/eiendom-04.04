import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../../common/Button';

export function PricingSection() {
  const plans = [
    {
      name: 'Basis Analyse',
      price: '995',
      description: 'Komplett analyse av én eiendom',
      features: [
        'Reguleringssjekk og begrensninger',
        'Grunnleggende byggemuligheter',
        'PDF-rapport med anbefalinger',
        'Én måneds tilgang til resultater',
        'Potensielt 50.000+ kr besparelse',
      ],
      cta: 'Kjøp analyse',
      popular: false,
    },
    {
      name: 'Utviklingspakke',
      price: '4.950',
      description: 'Visualisering og utbyggingsmuligheter',
      features: [
        'Alt fra Basis Analyse',
        '3D-visualisering av byggemuligheter',
        'To alternative utbyggingsforslag',
        'Grunnleggende ROI-beregning',
        '3 måneders tilgang til resultater',
        'Potensielt 200.000+ kr besparelse',
      ],
      cta: 'Velg utviklingspakke',
      popular: true,
    },
    {
      name: 'Premium Vurdering',
      price: '12.500',
      description: 'Komplett profesjonell analyse',
      features: [
        'Alt fra Utviklingspakke',
        'Fotorealistisk 3D-modellering',
        'Komplett økonomisk analyse',
        'Detaljerte anbefalinger',
        'Ubegrenset tilgang til resultater',
        'Prioritert kundesupport',
      ],
      cta: 'Bestill vurdering',
      popular: false,
    },
  ];

  return (
    <div className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Enkel prising for alle behov
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Velg analysen som passer best for ditt eiendomsprosjekt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`
                bg-gray-800/50 rounded-xl p-8 border 
                ${plan.popular ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-white/10'}
                relative
              `}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Mest populær
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">{plan.price.includes('Kontakt') ? '' : 'kr '}{plan.price}</span>
              </div>
              <p className="text-gray-300 mb-8">{plan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={plan.popular ? "primary" : "secondary"} 
                rightIcon={<ArrowRight size={16} />}
                className="w-full justify-center"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 