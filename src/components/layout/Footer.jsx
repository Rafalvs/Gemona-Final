import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Divider } from '@heroui/react'
import Logo from '../ui/Logo'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-black via-[#05315e] to-black text-[#ffecd1] shadow-2xl border-b border-[#ffecd1]/20 header-compact">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          
          {/* Logo Section */}
          <div className="flex items-center justify-center">
            <Logo size="md" textSize="2xl" />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              as={Link} 
              to="/contact"
              variant="ghost"
              color="primary"
              size="md"
              className="text-[#ffecd1] hover:text-[#ffecd1]/80 hover:bg-[#ffecd1]/10 transition-all duration-300 px-6 py-2 rounded-lg"
            >
              Sobre nós
            </Button>

            <Button 
              as={Link} 
              to="/contact"
              variant="ghost"
              color="primary"
              size="md"
              className="text-[#ffecd1] hover:text-[#ffecd1]/80 hover:bg-[#ffecd1]/10 transition-all duration-300 px-6 py-2 rounded-lg"
            >
              Contato
            </Button>
          </div>

          {/* Divider */}
          <Divider className="w-full max-w-md bg-[#ffecd1]/30" />
          
          {/* Copyright */}
          <div className="text-center text-[#ffecd1]/70">
            <p className="text-sm">&copy; 2025 Gêmona. Todos os direitos reservados.</p>
            <p className="text-xs mt-1">Conectando você aos melhores serviços da sua região</p>
          </div>
        </div>
      </div>
    </footer>
  )
}