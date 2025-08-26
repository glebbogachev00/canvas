'use client'

import { useEffect, useState } from 'react'
import type { GenerationParameters, AppTheme, EncryptionType, CodePosition } from '@/app/page'
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
    if (parameters.codePosition === 'none') return 'hidden'
    
    switch (parameters.codePosition) {
      case 'topLeft':
        return 'top-2 left-2'
      case 'topRight':
        return 'top-2 right-2'
      case 'bottomLeft':
        return 'bottom-2 left-2'
      case 'bottomRight':
        return 'bottom-2 right-2'
      case 'leftEdge':
        return 'left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center'
      case 'rightEdge':
        return 'right-2 top-1/2 -translate-y-1/2 rotate-90 origin-center'
      case 'bottomEdge':
        return 'bottom-2 left-1/2 -translate-x-1/2'
      default:
        return 'bottom-2 left-2'
    }
  }

  return (
    <div className={`absolute ${getPositionClasses()} z-20 pointer-events-none`}>
      <div className={`
        font-mono text-[8px] tracking-tight opacity-60
        transition-all duration-300 whitespace-nowrap
        ${
          theme === 'black' ? 'text-white' : 'text-black'
        }
      `}>
        {cryptoCode}
      </div>
    </div>
  )
}