import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const navigation = {
  main: [
    { name: 'Om oss', href: '/about' },
    { name: 'Priser', href: '/pricing' },
    { name: 'Bli partner', href: '/partner' },
    { name: 'Kontakt', href: '/contact' },
    { name: 'Personvern', href: '/privacy' },
    { name: 'Vilkår', href: '/terms' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: Facebook,
    },
    {
      name: 'Instagram',
      href: '#',
      icon: Instagram,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: Linkedin,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <Link href={item.href} className="text-sm leading-6 text-gray-400 hover:text-white">
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-10 flex justify-center space-x-10">
          {navigation.social.map((item) => (
            <Link key={item.name} href={item.href} className="text-gray-400 hover:text-white">
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center space-x-2">
          <Mail className="h-5 w-5 text-gray-400" />
          <a href="mailto:kontakt@eiendomsmuligheter.no" className="text-sm text-gray-400 hover:text-white">
            kontakt@eiendomsmuligheter.no
          </a>
        </div>
        <p className="mt-10 text-center text-xs leading-5 text-gray-400">
          &copy; {new Date().getFullYear()} Eiendomsmuligheter. Alle rettigheter reservert.
        </p>
      </div>
    </footer>
  );
} 