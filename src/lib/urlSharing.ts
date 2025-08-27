import type { GenerationParameters } from '@/app/page'

// Compress parameters into a URL-safe string
export function encodeParameters(params: GenerationParameters): string {
  const compressed = {
    p: params.patternType[0], // 'l', 't', 'm', 'a'
    c: Math.round((params.complexity || 0.5) * 100), // 0-100
    m: params.movement ? 1 : 0,
    s: params.colorScheme[0], // 'b', 'g', 's' 
    z: params.canvasSize,
    t: params.textInput || '',
    r: params.seed
  }
  
  const json = JSON.stringify(compressed)
  return btoa(json).replace(/[+/]/g, (m) => m === '+' ? '-' : '_').replace(/=+$/, '')
}

// Decode parameters from URL string
export function decodeParameters(encoded: string): Partial<GenerationParameters> | null {
  try {
    const base64 = encoded.replace(/[-_]/g, (m) => m === '-' ? '+' : '/')
    const padded = base64 + '==='.slice((base64.length + 3) % 4)
    const json = atob(padded)
    const compressed = JSON.parse(json)

    // Map back to full parameters
    const patternMap = { l: 'linear', t: 'texture', m: 'matrix', a: 'ascii' } as const
    const colorMap = { b: 'blackWhite', g: 'grayscale', s: 'saturatedRed' } as const

    return {
      patternType: patternMap[compressed.p as keyof typeof patternMap] || 'linear',
      complexity: (compressed.c || 50) / 100,
      movement: Boolean(compressed.m),
      colorScheme: colorMap[compressed.s as keyof typeof colorMap] || 'blackWhite',
      canvasSize: compressed.z || 512,
      textInput: compressed.t || '',
      seed: compressed.r || Math.random().toString(36).substring(7)
    }
  } catch (error) {
    console.error('Failed to decode parameters:', error)
    return null
  }
}

// Generate shareable URL
export function generateShareableUrl(params: GenerationParameters): string {
  const encoded = encodeParameters(params)
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : ''
  return `${baseUrl}?share=${encoded}`
}

// Get parameters from current URL
export function getParametersFromUrl(): Partial<GenerationParameters> | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  const shareParam = urlParams.get('share')
  
  if (!shareParam) return null
  
  return decodeParameters(shareParam)
}

// Copy to clipboard with fallback
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for insecure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}