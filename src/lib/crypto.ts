import type { GenerationParameters } from '@/app/page'

// Synchronous hash function for immediate use
export function generateHash(parameters: GenerationParameters): string {
  const timestamp = Date.now()
  const paramString = JSON.stringify({
    ...parameters,
    timestamp: Math.floor(timestamp / 1000) // Round to seconds for stability
  })
  
  // Simple hash function for immediate use (not cryptographically secure)
  let hash = 0
  for (let i = 0; i < paramString.length; i++) {
    const char = paramString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to hex and pad
  const hashHex = Math.abs(hash).toString(16).padStart(8, '0')
  
  // Create a longer hash by repeating and modifying
  return (hashHex + (Math.abs(hash * 7).toString(16).padStart(8, '0'))).substring(0, 16)
}