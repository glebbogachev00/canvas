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
    // Always use bottom left corner for digital signature
    return 'bottom-2 left-2'
  }

  return (
    <div className={`absolute ${getPositionClasses()} z-20 pointer-events-none`}>
      <div className={`
        font-mono text-[8px] tracking-tight opacity-60
        transition-all duration-300
        ${theme === 'black' 
          ? 'text-white/60' 
          : 'text-black/50'
        }
      `}>
        {cryptoCode}
      </div>
    </div>
  )
}