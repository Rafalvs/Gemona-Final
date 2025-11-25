import React from 'react'
import { Image } from '@heroui/react'
import logoImage from '../../assets/logo.jpg'

export default function Logo({ 
  size = 'md', 
  showText = true, 
  textSize = 'xl',
  className = '',
  rounded = true,
  border = true 
}) {
  const sizeClasses = {
    'sm': 'w-8 h-8',
    'md': 'w-12 h-12',
    'lg': 'w-16 h-16',
    'xl': 'w-20 h-20'
  }

  const textSizeClasses = {
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl'
  }

  const sizeStyles = {
    'sm': { width: '32px', height: '32px' },
    'md': { width: '48px', height: '48px' },
    'lg': { width: '64px', height: '64px' },
    'xl': { width: '80px', height: '80px' }
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div 
        style={{
          ...sizeStyles[size],
          borderRadius: rounded ? '50%' : '8px',
          border: border ? '2px solid rgba(255, 236, 209, 0.3)' : 'none',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          backgroundColor: 'white'
        }}
      >
        <Image
          src={logoImage}
          alt="Gêmona Logo"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {showText && (
        <span className={`font-bold text-[#ffecd1] drop-shadow-lg ${textSizeClasses[textSize]}`}>
          Gêmona
        </span>
      )}
    </div>
  )
}