import React from 'react';
import { Eye, Home, Building, TreePine } from 'lucide-react';
import { Button } from '../../common/Button';

export function Model3DShowcase() {
  const models = [
    {
      id: 'original',
      title: 'Eksisterende eiendom',
      description: 'En detaljert 3D-modell av eiendommen slik den er i dag, basert på satelittdata og matrikkelinformasjon.',
      icon: Home,
    },
    {
      id: 'options',
      title: 'Utbyggingsmuligheter',
      description: 'Visualisering av forskjellige utbyggingsmuligheter i henhold til reguleringsplanen for området.',
      icon: Building,
    },
    {
      id: 'environment',
      title: 'Omgivelser og kontekst',
      description: 'Se hvordan eiendommen relaterer til omgivelsene, inkludert sol/skygge-studier og visuell påvirkning.',
      icon: TreePine,
    },
  ];

  return (
    <div className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            3D Visualisering av eiendommer
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Opplev eiendommer på en helt ny måte med interaktive 3D-modeller
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl aspect-video relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-black/50 p-5 rounded-lg backdrop-blur-sm">
                  <p className="text-white mb-4">3D Modell Forhåndsvisning</p>
                  <Button 
                    variant="primary" 
                    rightIcon={<Eye size={16} />}
                  >
                    Se demo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {models.map((model) => (
              <div 
                key={model.id} 
                className="bg-gray-800/50 p-6 rounded-xl border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <model.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{model.title}</h3>
                    <p className="text-gray-300">{model.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 