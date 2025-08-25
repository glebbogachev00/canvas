import type { GenerationParameters } from '@/app/page'

// Convert text to binary string
export function textToBinary(text: string): string {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('')
}

// Convert binary string to array of 0s and 1s for easier manipulation
export function binaryToArray(binary: string): number[] {
  return binary.split('').map(bit => parseInt(bit, 10))
}

// Generate text-influenced seed from binary data
export function generateTextSeed(text: string, baseSeed: string): string {
  if (!text) return baseSeed
  
  const binary = textToBinary(text)
  const hash = binary.split('').reduce((acc, bit, index) => {
    return acc + (parseInt(bit) * (index + 1))
  }, 0)
  
  return baseSeed + hash.toString(36)
}

// Get binary data for artwork generation
export function getBinaryData(parameters: GenerationParameters): {
  binary: string
  bits: number[]
  hasText: boolean
} {
  const text = parameters.textInput || ''
  const hasText = text.length > 0
  const binary = hasText ? textToBinary(text) : ''
  const bits = hasText ? binaryToArray(binary) : []
  
  return { binary, bits, hasText }
}