import type { GenerationParameters, EncryptionType } from '@/app/page'
import { generateHash } from './crypto'

// Enhanced cryptographic operations for different encryption types
export class CryptoEnhanced {
  
  // Generate public/private key pair (simplified for demo)
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const publicKey = Math.random().toString(36).substring(2, 18).toUpperCase()
    const privateKey = Math.random().toString(36).substring(2, 18).toLowerCase()
    return { publicKey, privateKey }
  }

  // Binary encryption - convert text to binary with XOR cipher
  static binaryEncrypt(text: string, seed: string): string {
    const seedNum = this.seedToNumber(seed)
    return text.split('').map((char, i) => {
      const charCode = char.charCodeAt(0)
      const keyByte = (seedNum + i) % 256
      const encrypted = charCode ^ keyByte
      return encrypted.toString(2).padStart(8, '0')
    }).join('').substring(0, 32) // Limit to 32 bits for display
  }

  // Hash encryption - layered SHA256 with salt
  static hashEncrypt(text: string, seed: string): string {
    const salt = this.generateSalt(seed)
    const input = text + salt + seed
    const hash = generateHash({ 
      textInput: input, 
      seed, 
      patternType: 'linear', 
      complexity: 0.5, 
      movement: false, 
      colorScheme: 'blackWhite', 
      canvasSize: 512,
      encryptionType: 'hash',
      codePosition: 'topRight'
    })
    return hash.substring(0, 16).toUpperCase()
  }

  // Cipher encryption - custom substitution cipher
  static cipherEncrypt(text: string, seed: string): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const seedNum = this.seedToNumber(seed)
    
    // Generate cipher key based on seed
    const shuffled = alphabet.split('').map((char, i) => ({
      char,
      order: (seedNum + i * 7) % 36
    })).sort((a, b) => a.order - b.order).map(item => item.char)
    
    return text.toUpperCase().split('').map(char => {
      const index = alphabet.indexOf(char)
      return index >= 0 ? shuffled[index] : char
    }).join('').substring(0, 12)
  }

  // Digital signature encryption - RSA-style with validation
  static signatureEncrypt(text: string, seed: string): string {
    const { publicKey, privateKey } = this.generateKeyPair()
    
    // Create signature hash
    const message = text + seed + publicKey
    const signature = this.simpleHash(message).substring(0, 8).toUpperCase()
    
    return `${signature}-${publicKey.substring(0, 4)}`
  }

  // Generate encryption based on type
  static encryptByType(text: string, seed: string, type: EncryptionType): string {
    switch (type) {
      case 'binary':
        return this.binaryEncrypt(text, seed)
      case 'hash':
        return this.hashEncrypt(text, seed)
      case 'cipher':
        return this.cipherEncrypt(text, seed)
      case 'signature':
        return this.signatureEncrypt(text, seed)
      default:
        return this.hashEncrypt(text, seed)
    }
  }

  // Utility functions
  private static seedToNumber(seed: string): number {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff
    }
    return Math.abs(hash)
  }

  private static generateSalt(seed: string): string {
    const saltChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const seedNum = this.seedToNumber(seed)
    return Array.from({ length: 8 }, (_, i) => 
      saltChars[(seedNum + i * 3) % saltChars.length]
    ).join('')
  }

  private static simpleHash(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash + input.charCodeAt(i)) & 0xffffffff
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  // Generate layered artwork data for signature mode
  static generateLayeredData(parameters: GenerationParameters): {
    publicLayer: any
    privateLayer: any
    signature: string
  } {
    const publicSeed = parameters.seed + '_public'
    const privateSeed = parameters.seed + '_private'
    const signature = this.signatureEncrypt(parameters.textInput || 'canvas', parameters.seed)

    return {
      publicLayer: {
        seed: publicSeed,
        complexity: (parameters.complexity || 0.5) * 0.7, // Reduced complexity for public
        movement: false,
        textInput: 'public_' + (parameters.textInput || '')
      },
      privateLayer: {
        seed: privateSeed,
        complexity: (parameters.complexity || 0.5) * 1.3, // Enhanced complexity for private
        movement: parameters.movement,
        textInput: 'private_' + (parameters.textInput || '')
      },
      signature
    }
  }
}