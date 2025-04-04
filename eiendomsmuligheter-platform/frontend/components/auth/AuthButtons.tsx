"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';

export const AuthButtons = () => {
  const [isHovered, setIsHovered] = useState<'login' | 'register' | null>(null);
  
  return (
    <div className="flex items-center space-x-3">
      {/* Logg inn-knapp */}
      <Link href="/auth/login">
        <motion.button
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
            isHovered === 'login' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setIsHovered('login')}
          onMouseLeave={() => setIsHovered(null)}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Logg inn
        </motion.button>
      </Link>
      
      {/* Registrer deg-knapp */}
      <Link href="/auth/register">
        <motion.button
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
            isHovered === 'register' 
              ? 'bg-white text-purple-700' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setIsHovered('register')}
          onMouseLeave={() => setIsHovered(null)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Registrer deg
        </motion.button>
      </Link>
    </div>
  );
}; 