import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function PartnersPage() {
  return (
    <>
      <Head>
        <title>Partner Dashboard - Eiendomsmuligheter</title>
        <meta name="description" content="Partner-dashboard for Eiendomsmuligheter" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Partner Dashboard</h1>
          <p className="text-xl text-gray-300 mb-8">
            Denne seksjonen er under utvikling. Kom tilbake senere for å få tilgang til partnerportalen.
          </p>

          <div className="mt-10">
            <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
              Tilbake til hjemmesiden
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 