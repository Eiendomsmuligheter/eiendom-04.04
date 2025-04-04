import React from 'react';
import { Hero } from '../components/home/Hero';
import { Features } from '../components/home/Features';
import { Model3DShowcase } from '../components/home/Model3DShowcase';
import { PricingSection } from '../components/home/PricingSection';
import { ChatAssistant } from '../components/home/ChatAssistant';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Eiendomsmuligheter - Finn din neste eiendomsmulighet</title>
        <meta name="description" content="Få en komplett 3D-analyse av eiendommer og tomter. Opplev fremtidsmulighetene før du investerer." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="bg-black text-white">
        <Hero />
        <Features />
        <Model3DShowcase />
        <PricingSection />
        <ChatAssistant />
      </div>
    </>
  );
} 