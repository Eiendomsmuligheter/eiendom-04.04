import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

const navigation = [
  { name: 'Hjem', href: '/' },
  { name: 'Søk', href: '/search' },
  { name: 'Priser', href: '/pricing' },
  { name: 'Om oss', href: '/about' },
  { name: 'Kontakt', href: '/contact' },
];

const userNavigation = [
  { name: 'Min profil', href: '/profile', icon: User },
  { name: 'Innstillinger', href: '/settings', icon: Settings },
  { name: 'Logg ut', href: '/logout', icon: LogOut },
];

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Eiendomsmuligheter
              </span>
            </Link>
            <div className="hidden ml-10 space-x-8 lg:block">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    router.pathname === link.href
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex lg:items-center lg:gap-4">
              <Button variant="secondary" size="sm">
                Logg inn
              </Button>
              <Button size="sm">Bli partner</Button>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Åpne hovedmeny</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'lg:hidden',
            mobileMenuOpen
              ? 'fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm'
              : 'hidden'
          )}
        >
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Eiendomsmuligheter
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Lukk meny</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/25">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Button className="w-full mb-3" variant="secondary">
                    Logg inn
                  </Button>
                  <Button className="w-full">Bli partner</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
} 