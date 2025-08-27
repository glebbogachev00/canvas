import type { GenerationParameters } from '@/app/page'
import { generateLinear, generateTexture, generateMatrix } from './generators'
import { generateHash } from './crypto'

interface BatchExportOptions {
  count: number
  format: 'png' | 'jpg'
  size: number
  varyParameters: boolean
  namePrefix: string
}

export class BatchExporter {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    // Create offscreen canvas for batch export
    this.canvas = document.createElement('canvas')
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Could not create canvas context')
    this.ctx = ctx
  }

  async exportBatch(
    baseParameters: GenerationParameters, 
    options: BatchExportOptions
  ): Promise<{ success: boolean; exported: number; errors: string[] }> {
    const { count, format, size, varyParameters, namePrefix } = options
    const errors: string[] = []
    let exported = 0

    // Set canvas size
    this.canvas.width = size
    this.canvas.height = size

    for (let i = 0; i < count; i++) {
      try {
        // Generate varied parameters if requested
        const parameters: GenerationParameters = varyParameters 
          ? this.varyParameters(baseParameters, i, count)
          : { ...baseParameters, seed: `${baseParameters.seed}-${i}` }

        // Clear canvas
        this.ctx.fillStyle = '#FFFFFF'
        this.ctx.fillRect(0, 0, size, size)

        // Generate artwork
        switch (parameters.patternType) {
          case 'linear':
            generateLinear(this.ctx, parameters)
            break
          case 'texture':
            generateTexture(this.ctx, parameters)
            break
          case 'matrix':
            generateMatrix(this.ctx, parameters)
            break
          case 'ascii':
            // Handle ascii pattern type
            generateLinear(this.ctx, parameters)
            break
        }

        // Generate hash and filename
        const hash = generateHash(parameters)
        const filename = `${namePrefix}-${String(i + 1).padStart(3, '0')}-${hash.substring(0, 8)}.${format}`

        // Export image
        await this.downloadCanvas(filename, format)
        exported++

        // Small delay to prevent browser hanging
        if (i % 5 === 4) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

      } catch (error) {
        errors.push(`Export ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return { success: exported > 0, exported, errors }
  }

  private varyParameters(base: GenerationParameters, index: number, total: number): GenerationParameters {
    const progress = index / (total - 1)
    const random = this.seededRandom(base.seed + index)

    return {
      ...base,
      complexity: this.varyValue(base.complexity || 0.5, 0.1, 1.0, progress, random),
      colorScheme: this.pickVariant(['blackWhite', 'grayscale', 'saturatedRed'], base.colorScheme, random),
      seed: `${base.seed}-${index}-${Math.floor(random() * 1000)}`
    }
  }

  private varyValue(base: number, min: number, max: number, progress: number, random: () => number): number {
    // Mix between linear progression and random variation
    const linear = min + (max - min) * progress
    const randomOffset = (random() - 0.5) * 0.3 * (max - min)
    return Math.max(min, Math.min(max, linear + randomOffset))
  }

  private pickVariant<T>(options: T[], current: T, random: () => number): T {
    // 70% chance to keep current, 30% chance to pick different
    if (random() < 0.7) return current
    const filtered = options.filter(opt => opt !== current)
    return filtered[Math.floor(random() * filtered.length)] || current
  }

  private seededRandom(seed: string): () => number {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff
    }
    
    return function() {
      hash = (hash * 9301 + 49297) % 233280
      return hash / 233280
    }
  }

  private async downloadCanvas(filename: string, format: 'png' | 'jpg'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'))
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        resolve()
      }, format === 'png' ? 'image/png' : 'image/jpeg', 0.9)
    })
  }

  dispose() {
    // Clean up if needed
  }
}

// Estimate batch export time
export function estimateBatchTime(count: number, size: number): string {
  const baseTime = 500 // ms per export
  const sizeMultiplier = (size / 512) ** 2
  const totalMs = count * baseTime * sizeMultiplier
  
  if (totalMs < 60000) {
    return `~${Math.ceil(totalMs / 1000)}s`
  } else {
    return `~${Math.ceil(totalMs / 60000)}m`
  }
}