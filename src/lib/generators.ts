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
  const { canvasSize, colorScheme, seed } = params
  const complexity = 0.6 // Fixed complexity level
  const { bits, hasText } = getBinaryData(params)
  const enhancedSeed = generateTextSeed(params.textInput || '', seed)
  const rng = new SeededRandom(enhancedSeed)
  
  // Set color based on scheme
  const getColor = () => {
    switch (colorScheme) {
      case 'blackWhite':
        return rng.next() > 0.5 ? '#000000' : '#FFFFFF'
      case 'grayscale':
        const gray = Math.floor(rng.next() * 256)
        return `rgb(${gray}, ${gray}, ${gray})`
      case 'saturatedRed':
        return rng.next() > 0.7 ? '#FF0000' : '#000000'
      default:
        return '#000000'
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
  const { canvasSize, colorScheme, seed } = params
  const complexity = 0.6 // Fixed complexity level
  const { bits, hasText } = getBinaryData(params)
  const enhancedSeed = generateTextSeed(params.textInput || '', seed)
  const rng = new SeededRandom(enhancedSeed)
  
  const chars = ['0', '1', '~', '.', '+', '-', '|', '/', '\\', '*']
  const lineHeight = Math.floor(8 + (8 * complexity))
  const fontSize = Math.floor(6 + (6 * complexity))
  
  const getColor = () => {
    switch (colorScheme) {
      case 'blackWhite':
        return rng.next() > 0.5 ? '#000000' : '#FFFFFF'
      case 'grayscale':
        const gray = Math.floor(50 + rng.next() * 200)
        return `rgb(${gray}, ${gray}, ${gray})`
      case 'saturatedRed':
        return rng.next() > 0.7 ? '#FF0000' : '#000000'
      default:
        return '#000000'
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

export function generateMatrix(ctx: CanvasRenderingContext2D, params: GenerationParameters, audioData?: AudioFrequencyData | null) {
  const { canvasSize, colorScheme, seed } = params
  const complexity = 0.6 // Fixed complexity level
  const { bits, hasText } = getBinaryData(params)
  const enhancedSeed = generateTextSeed(params.textInput || '', seed)
  const rng = new SeededRandom(enhancedSeed)
  
  // Grid-based network pattern
  const gridSize = Math.floor(20 + complexity * 30)
  const nodeChance = 0.3 + complexity * 0.4
  const connectionChance = 0.2 + complexity * 0.3
  
  const getColor = () => {
    switch (colorScheme) {
      case 'blackWhite':
        return rng.next() > 0.5 ? '#000000' : '#FFFFFF'
      case 'grayscale':
        const gray = Math.floor(rng.next() * 256)
        return `rgb(${gray}, ${gray}, ${gray})`
      case 'saturatedRed':
        return rng.next() > 0.7 ? '#FF0000' : '#000000'
      default:
        return '#000000'
    }
  }

  // Create grid nodes
  const nodes: { x: number; y: number; active: boolean }[] = []
  const cols = Math.floor(canvasSize / gridSize)
  const rows = Math.floor(canvasSize / gridSize)
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * gridSize + gridSize / 2
      const y = row * gridSize + gridSize / 2
      let active = rng.next() < nodeChance
      
      // Binary data influences node activation
      if (hasText && bits.length > 0) {
        const nodeIndex = row * cols + col
        const bitIndex = nodeIndex % bits.length
        const bitValue = bits[bitIndex] || 0
        active = bitValue === 1 || (bitValue === 0 && rng.next() < 0.3)
      }
      
      nodes.push({ x, y, active })
    }
  }

  // Draw connections between nearby active nodes
  ctx.strokeStyle = getColor()
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.4
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (!node.active) continue
    
    // Connect to nearby nodes
    for (let j = i + 1; j < nodes.length; j++) {
      const otherNode = nodes[j]
      if (!otherNode.active) continue
      
      const dx = otherNode.x - node.x
      const dy = otherNode.y - node.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Only connect nearby nodes
      if (distance < gridSize * 2.5 && rng.next() < connectionChance) {
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(otherNode.x, otherNode.y)
        ctx.stroke()
      }
    }
  }

  // Draw nodes
  ctx.globalAlpha = 0.8
  for (const node of nodes) {
    if (node.active) {
      ctx.fillStyle = getColor()
      ctx.beginPath()
      ctx.arc(node.x, node.y, 2 + rng.next() * 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  ctx.globalAlpha = 1
}

export function generateASCII(ctx: CanvasRenderingContext2D, params: GenerationParameters, audioData?: AudioFrequencyData | null) {
  const { canvasSize, colorScheme, seed } = params
  const complexity = 0.6 // Fixed complexity level
  const { bits, hasText } = getBinaryData(params)
  const enhancedSeed = generateTextSeed(params.textInput || '', seed)
  const rng = new SeededRandom(enhancedSeed)
  
  // Matrix rain characters - mix of binary, letters, and symbols
  const matrixChars = ['0', '1', '~', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  
  // If we have text input, prioritize binary representation
  const displayChars = hasText ? ['0', '1', '~', ' '] : matrixChars
  
  // Set up font
  const fontSize = Math.floor(8 + complexity * 12) // 8px to 20px based on complexity
  ctx.font = `${fontSize}px 'Courier New', monospace`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  
  // Get color based on scheme
  const getColor = (intensity: number = 1) => {
    switch (colorScheme) {
      case 'blackWhite':
        return rng.next() > 0.5 ? `rgba(0, 0, 0, ${intensity})` : `rgba(255, 255, 255, ${intensity})`
      case 'grayscale':
        const gray = Math.floor(intensity * 256)
        return `rgba(${gray}, ${gray}, ${gray}, ${intensity})`
      case 'saturatedRed':
        return intensity > 0.7 ? `rgba(255, 0, 0, ${intensity})` : `rgba(0, 0, 0, ${intensity})`
      default:
        return `rgba(0, 0, 0, ${intensity})`
    }
  }
  
  // Calculate grid
  const charWidth = fontSize * 0.6
  const charHeight = fontSize * 1.2
  const cols = Math.floor(canvasSize / charWidth)
  const rows = Math.floor(canvasSize / charHeight)
  
  // Audio reactivity
  const audioBoost = audioData ? (audioData.bass + audioData.mid) / 2 : 0
  const totalIntensity = complexity + audioBoost * 0.5
  
  // Static background pattern (like the screenshot)
  const bgDensity = totalIntensity * 0.8
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (rng.next() < bgDensity) {
        const x = col * charWidth
        const y = row * charHeight
        
        // Choose character based on text input
        let char
        if (hasText && bits.length > 0) {
          const bitIndex = (row * cols + col) % bits.length
          char = String(bits[bitIndex])
        } else {
          char = matrixChars[Math.floor(rng.next() * matrixChars.length)]
        }
        
        // Fade intensity based on position and randomness
        const intensity = 0.15 + rng.next() * 0.6
        ctx.fillStyle = getColor(intensity)
        ctx.fillText(char, x, y)
      }
    }
  }
  
  // Add subtle noise pattern for enhanced texture
  if (complexity > 0.4) {
    const noiseIntensity = (complexity - 0.4) * 0.3
    for (let i = 0; i < canvasSize * noiseIntensity; i++) {
      const x = rng.next() * canvasSize
      const y = rng.next() * canvasSize
      const char = matrixChars[Math.floor(rng.next() * matrixChars.length)]
      
      ctx.fillStyle = getColor(0.05 + rng.next() * 0.2)
      ctx.fillText(char, x, y)
    }
  }
}