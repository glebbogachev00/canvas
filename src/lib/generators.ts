import type { GenerationParameters } from '@/app/page'
import { getBinaryData, generateTextSeed } from './textToBits'
import type { AudioFrequencyData } from './audioAnalysis'

// Seeded random number generator for consistent results
class SeededRandom {
  private seed: number

  constructor(seed: string) {
    this.seed = this.hashString(seed)
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

// Noise function for organic patterns
function noise(x: number, seed: number = 0): number {
  const n = Math.sin(x + seed) * 43758.5453
  return n - Math.floor(n)
}

export function generateLinear(ctx: CanvasRenderingContext2D, params: GenerationParameters, audioData?: AudioFrequencyData | null) {
  const { canvasSize, complexity, colorScheme, seed } = params
  const { bits, hasText } = getBinaryData(params)
  const enhancedSeed = generateTextSeed(params.textInput || '', seed)
  const rng = new SeededRandom(enhancedSeed)
  
  // Set color based on scheme
  const getColor = () => {
    switch (colorScheme) {
      case 'monochrome':
        return '#0A0A0A'
      case 'grayscale':
        const gray = Math.floor(rng.next() * 128)
        return `rgb(${gray}, ${gray}, ${gray})`
      case 'accent':
        return rng.next() > 0.8 ? '#FF6B35' : '#0A0A0A'
      default:
        return '#0A0A0A'
    }
  }

  // Generate vertical lines with varying dot densities
  const spacing = Math.max(2, Math.floor(20 * (1 - complexity)))
  const maxDots = Math.floor(50 * complexity)

  for (let x = 0; x < canvasSize; x += spacing) {
    let density = noise(x * 0.01, rng.next()) * complexity * maxDots
    
    // If we have text, use binary data to influence density
    if (hasText && bits.length > 0) {
      const bitIndex = Math.floor((x / canvasSize) * bits.length)
      const bitValue = bits[bitIndex] || 0
      density *= (0.5 + bitValue * 0.8) // 0s create sparser areas, 1s create denser areas
    }

    // Audio reactivity - bass drives density, beat creates bursts
    if (audioData) {
      density *= (0.3 + audioData.bass * 1.2) // Bass influences density
      if (audioData.beat) {
        density *= 1.5 // Beat creates burst effect
      }
    }
    
    ctx.fillStyle = getColor()
    
    for (let i = 0; i < density; i++) {
      let y = rng.next() * canvasSize
      
      // Binary data can influence vertical position too
      if (hasText && bits.length > 0) {
        const bitIndex = Math.floor((i / density) * bits.length)
        const bitValue = bits[bitIndex] || 0
        y = y * (0.3 + bitValue * 0.7) // 0s push towards top, 1s allow full height
      }

      // Audio influences vertical distribution - treble at top, bass at bottom
      if (audioData) {
        const audioInfluence = (audioData.treble - audioData.bass) * 0.3
        y += audioInfluence * canvasSize * 0.5
        y = Math.max(0, Math.min(canvasSize, y))
      }
      
      let dotSize = Math.max(0.5, rng.next() * 3 * complexity)
      
      // Audio volume affects dot size
      if (audioData) {
        dotSize *= (0.5 + audioData.volume * 0.8)
      }
      
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Add some vertical rhythm lines
  const lineCount = Math.floor(5 * complexity)
  ctx.strokeStyle = getColor()
  ctx.lineWidth = 0.5
  
  for (let i = 0; i < lineCount; i++) {
    const x = rng.next() * canvasSize
    const opacity = 0.3 + (rng.next() * 0.4)
    ctx.globalAlpha = opacity
    
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasSize)
    ctx.stroke()
  }
  
  ctx.globalAlpha = 1
}

export function generateTexture(ctx: CanvasRenderingContext2D, params: GenerationParameters, audioData?: AudioFrequencyData | null) {
  const { canvasSize, complexity, colorScheme, seed } = params
  const { bits, hasText } = getBinaryData(params)
  const enhancedSeed = generateTextSeed(params.textInput || '', seed)
  const rng = new SeededRandom(enhancedSeed)
  
  const chars = ['0', '1', '~', '.', '+', '-', '|', '/', '\\', '*']
  const lineHeight = Math.floor(8 + (8 * complexity))
  const fontSize = Math.floor(6 + (6 * complexity))
  
  const getColor = () => {
    switch (colorScheme) {
      case 'monochrome':
        return '#0A0A0A'
      case 'grayscale':
        const gray = Math.floor(50 + rng.next() * 150)
        return `rgb(${gray}, ${gray}, ${gray})`
      case 'accent':
        return rng.next() > 0.7 ? '#FF6B35' : '#0A0A0A'
      default:
        return '#0A0A0A'
    }
  }

  ctx.font = `${fontSize}px 'Menlo', monospace`
  ctx.textBaseline = 'top'

  for (let y = 0; y < canvasSize; y += lineHeight) {
    let pattern = ''
    let lineComplexity = noise(y * 0.02, rng.next()) * complexity
    const charsPerLine = Math.floor(canvasSize / (fontSize * 0.6))
    
    // Binary data influences line complexity
    if (hasText && bits.length > 0) {
      const lineIndex = Math.floor((y / canvasSize) * bits.length)
      const bitValue = bits[lineIndex] || 0
      lineComplexity *= (0.3 + bitValue * 0.9) // 0s = sparse, 1s = dense
    }
    
    for (let x = 0; x < charsPerLine; x++) {
      let shouldPlace = rng.next() < lineComplexity
      
      // Use binary data to directly place 0s and 1s when available
      if (hasText && bits.length > 0) {
        const charIndex = Math.floor((x / charsPerLine + y / canvasSize) * bits.length)
        const bitValue = bits[charIndex]
        if (bitValue !== undefined) {
          if (shouldPlace) {
            pattern += bitValue.toString() // Place actual binary digit
          } else {
            pattern += ' '
          }
        } else {
          // Fall back to random chars
          if (shouldPlace) {
            const charIdx = Math.floor(rng.next() * chars.length)
            pattern += chars[charIdx]
          } else {
            pattern += ' '
          }
        }
      } else {
        if (shouldPlace) {
          const charIdx = Math.floor(rng.next() * chars.length)
          pattern += chars[charIdx]
        } else {
          pattern += ' '
        }
      }
    }
    
    ctx.fillStyle = getColor()
    ctx.fillText(pattern, 0, y)
  }

  // Add some organic blob shapes
  const blobCount = Math.floor(3 + (7 * complexity))
  
  for (let i = 0; i < blobCount; i++) {
    const centerX = rng.next() * canvasSize
    const centerY = rng.next() * canvasSize
    const size = 10 + (rng.next() * 30 * complexity)
    const points = 6 + Math.floor(rng.next() * 8)
    
    ctx.fillStyle = getColor()
    ctx.globalAlpha = 0.1 + (rng.next() * 0.3)
    
    ctx.beginPath()
    for (let j = 0; j <= points; j++) {
      const angle = (j / points) * Math.PI * 2
      const radius = size * (0.7 + rng.next() * 0.6)
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()
  }
  
  ctx.globalAlpha = 1
}

export function generateGeometric(ctx: CanvasRenderingContext2D, params: GenerationParameters, audioData?: AudioFrequencyData | null) {
  const { canvasSize, complexity, colorScheme, seed } = params
  const { bits, hasText } = getBinaryData(params)
  const enhancedSeed = generateTextSeed(params.textInput || '', seed)
  const rng = new SeededRandom(enhancedSeed)
  
  const center = { x: canvasSize / 2, y: canvasSize / 2 }
  const maxRadius = canvasSize * 0.4
  const shapeCount = Math.floor(10 + (50 * complexity))
  
  const getColor = () => {
    switch (colorScheme) {
      case 'monochrome':
        return '#0A0A0A'
      case 'grayscale':
        const gray = Math.floor(rng.next() * 200)
        return `rgb(${gray}, ${gray}, ${gray})`
      case 'accent':
        return rng.next() > 0.6 ? '#FF6B35' : '#0A0A0A'
      default:
        return '#0A0A0A'
    }
  }

  // Generate radial polygon arrangements
  for (let i = 0; i < shapeCount; i++) {
    const progress = i / shapeCount
    let angle = progress * Math.PI * 2 * (2 + complexity * 3) // Multiple rotations
    let radius = (rng.next() * 0.5 + 0.2) * maxRadius * (0.3 + complexity * 0.7)
    
    // Binary data influences positioning
    if (hasText && bits.length > 0) {
      const bitIndex = Math.floor((i / shapeCount) * bits.length)
      const bitValue = bits[bitIndex] || 0
      angle *= (0.5 + bitValue * 1.0) // 0s compress angles, 1s expand them
      radius *= (0.6 + bitValue * 0.8) // 0s pull inward, 1s push outward
    }
    
    const x = center.x + Math.cos(angle) * radius
    const y = center.y + Math.sin(angle) * radius
    
    // Draw polygon - binary data affects shape
    let sides = 3 + Math.floor(rng.next() * 5)
    let size = 3 + (rng.next() * 15 * complexity)
    
    // Use binary data to influence polygon complexity
    if (hasText && bits.length > 0) {
      const bitIndex = Math.floor((i / shapeCount) * bits.length)
      const bitValue = bits[bitIndex] || 0
      sides = bitValue === 1 ? Math.max(sides, 6) : Math.min(sides, 4) // 1s = more complex, 0s = simpler
      size *= (0.5 + bitValue * 0.8)
    }
    
    const rotation = rng.next() * Math.PI * 2
    
    ctx.fillStyle = getColor()
    ctx.globalAlpha = 0.3 + (rng.next() * 0.5)
    
    ctx.beginPath()
    for (let j = 0; j < sides; j++) {
      const vertexAngle = (j / sides) * Math.PI * 2 + rotation
      const vertexX = x + Math.cos(vertexAngle) * size
      const vertexY = y + Math.sin(vertexAngle) * size
      
      if (j === 0) {
        ctx.moveTo(vertexX, vertexY)
      } else {
        ctx.lineTo(vertexX, vertexY)
      }
    }
    ctx.closePath()
    ctx.fill()
  }

  // Add connecting lines for mandala effect
  if (complexity > 0.3) {
    ctx.strokeStyle = getColor()
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.2
    
    const connectionCount = Math.floor(20 * complexity)
    for (let i = 0; i < connectionCount; i++) {
      const angle1 = rng.next() * Math.PI * 2
      const angle2 = rng.next() * Math.PI * 2
      const radius1 = rng.next() * maxRadius * 0.8
      const radius2 = rng.next() * maxRadius * 0.8
      
      const x1 = center.x + Math.cos(angle1) * radius1
      const y1 = center.y + Math.sin(angle1) * radius1
      const x2 = center.x + Math.cos(angle2) * radius2
      const y2 = center.y + Math.sin(angle2) * radius2
      
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }
  
  ctx.globalAlpha = 1
}