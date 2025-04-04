import React from 'react';
import { Box, Building, Ruler, BarChart, Clock, Shield } from 'lucide-react';

export function Features() {
  const features = [
    {
      name: '3D Modellering',
      description: 'Opplev eiendommen i tre dimensjoner med fotorealistiske modeller og mulighet for virtuell befaring.',
      icon: Box,
    },
    {
      name: 'Reguleringsanalyse',
      description: 'Automatisk analyse av lokale reguleringsplaner og byggeregler for din eiendom.',
      icon: Building,
    },
    {
      name: 'Tomteutnyttelse',
      description: 'Beregn maksimal utnyttelse av tomten i forhold til BYA, BRA og andre nøkkelmål.',
      icon: Ruler,
    },
    {
      name: 'Verdivurdering',
      description: 'Få en markedsbasert verdivurdering basert på sammenlignbare eiendommer og utviklingspotensial.',
      icon: BarChart,
    },
    {
      name: 'Tidsbesparende',
      description: 'Spar uker med research og analysearbeid som ellers ville tatt betydelig tid og ressurser.',
      icon: Clock,
    },
    {
      name: 'Sikker Investering',
      description: 'Reduser risiko og ta bedre beslutninger med et komplett informasjonsgrunnlag.',
      icon: Shield,
    },
  ];

  return (
    <div className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Smarte verktøy for eiendomsanalyse
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Vår plattform kombinerer kraftige analyseverktøy, 3D-modellering og lokal byggekompetanse for å gi deg de beste beslutningsgrunnlagene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.name} 
              className="bg-gray-800/50 p-6 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all"
            >
              <div className="bg-blue-500/10 p-3 rounded-lg w-fit mb-4">
                <feature.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.name}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 