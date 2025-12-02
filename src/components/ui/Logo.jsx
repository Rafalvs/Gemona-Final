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

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${rounded ? 'rounded-full' : 'rounded-lg'} 
          ${border ? 'border-2 border-[#ffecd1]/30' : ''} 
          overflow-hidden shadow-xl bg-white
        `}
      >
        <Image
          src={logoImage}
          alt="Gêmona Logo"
          className="w-full h-full object-cover"
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