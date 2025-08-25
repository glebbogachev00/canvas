'use client'

import { useEffect, useState } from 'react'
import type { GenerationParameters, AppTheme, EncryptionType, CornerPosition } from '@/app/page'
import { generateHash } from '@/lib/crypto'
import { CryptoEnhanced } from '@/lib/cryptoEnhanced'

interface CryptoDisplayProps {
  parameters: GenerationParameters
  theme: AppTheme
}

export default function CryptoDisplay({ parameters, theme }: CryptoDisplayProps) {
  const [cryptoCode, setCryptoCode] = useState<string>('')

  useEffect(() => {
    generateCryptoCode()
  }, [parameters])

  const generateCryptoCode = () => {
    const inputText = parameters.textInput || parameters.seed
    const encryptedData = CryptoEnhanced.encryptByType(inputText, parameters.seed, parameters.encryptionType)
    
    switch (parameters.encryptionType) {
      case 'binary':
        setCryptoCode(`BIN:${encryptedData}`)
        break
        
      case 'hash':
        setCryptoCode(`SHA:${encryptedData}`)
        break
        
      case 'cipher':
        setCryptoCode(`CIP:${encryptedData}`)
        break
        
      case 'signature':
        setCryptoCode(`SIG:${encryptedData}`)
        break
        
      default:
        setCryptoCode(`HSH:${encryptedData}`)
    }
  }

  const getPositionClasses = () => {
    switch (parameters.cornerPosition) {
      case 'topLeft':
        return 'top-4 left-4'
      case 'topRight':
        return 'top-4 right-4'
      case 'bottomRight':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div className={`absolute ${getPositionClasses()} z-20 pointer-events-none`}>
      <div className={`
        px-4 py-3 rounded-lg font-black text-base tracking-widest uppercase
        transition-all duration-300 shadow-2xl backdrop-blur-md
        border-2 transform hover:scale-105
        ${theme === 'black' 
          ? 'bg-white text-black border-white shadow-white/20' 
          : 'bg-black text-white border-black shadow-black/50'
        }
      `}>
        {cryptoCode}
      </div>
    </div>
  )
}