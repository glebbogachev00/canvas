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
        return 'bottom-4 left-4' // Default to bottom left for signature
    }
  }

  return (
    <div className={`absolute ${getPositionClasses()} z-20 pointer-events-none`}>
      <div className={`
        px-3 py-1 font-mono text-xs tracking-wide
        transition-all duration-300 backdrop-blur-sm
        ${theme === 'black' 
          ? 'text-white/80 bg-black/10 border-l-2 border-white/20' 
          : 'text-black/70 bg-white/10 border-l-2 border-black/20'
        }
      `}>
        {cryptoCode}
      </div>
    </div>
  )
}