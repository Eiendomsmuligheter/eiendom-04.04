import React, { useCallback, useState } from 'react';
import { Search, Upload, ArrowRight } from 'lucide-react';
import { Button } from '../../common/Button';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

export function Hero() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    // I en virkelig app ville vi sender filene til serveren her
    console.log("Filer mottatt:", acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.google-earth.kml+xml': ['.kml'],
      'application/zip': ['.zip']
    }
  });

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center">
      {/* Bakgrunnsbilde med overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: 'url(/images/property-hero.jpg)', 
            filter: 'brightness(0.4)'
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-blue-900/50 to-black/60"></div>
      </div>

      {/* Bakgrunnseffekter */}
      <div className="absolute inset-0 z-1">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-32 sm:px-6 sm:pt-24 sm:pb-40 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="block text-white">Finn din neste</span>
            <span className="block gradient-text mt-2">eiendomsmulighet</span>
          </motion.h1>
          
          <motion.p 
            className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Få en komplett 3D-analyse av eiendommer og tomter. 
            Opplev fremtidsmulighetene før du investerer.
          </motion.p>
          
          {/* Dra og slipp + søkefelt */}
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex flex-col space-y-6 max-w-2xl mx-auto">
              {/* Dra og slipp boks */}
              <div 
                {...getRootProps()} 
                className={`
                  cursor-pointer p-10 rounded-xl border-2 border-dashed 
                  ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50'} 
                  transition-all duration-200 backdrop-blur-lg
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center">
                  <Upload size={32} className="text-blue-400 mb-3" />
                  <p className="text-white text-center font-medium">
                    Dra og slipp filer her, eller klikk for å velge
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Støtter PDF, bilder, Excel, KML og mer
                  </p>
                  {files.length > 0 && (
                    <div className="mt-4 text-sm text-green-400">
                      {files.length} {files.length === 1 ? 'fil' : 'filer'} valgt
                    </div>
                  )}
                </div>
              </div>

              {/* Søkefelt */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-20 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Skriv inn adresse eller eiendom..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight size={16} />}>
                    Søk
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Statistikk */}
          <motion.div 
            className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div>
              <p className="text-4xl font-bold text-white">15K+</p>
              <p className="mt-2 text-gray-400">Eiendommer analysert</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">98%</p>
              <p className="mt-2 text-gray-400">Fornøyde kunder</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-4xl font-bold text-white">24/7</p>
              <p className="mt-2 text-gray-400">Støtte og hjelp</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 