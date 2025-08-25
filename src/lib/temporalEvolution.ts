import type { GenerationParameters } from '@/app/page'

export class TemporalEvolution {
  private startTime: number = Date.now()
  private baseParameters: GenerationParameters
  private evolutionSpeed: number = 0.0001 // Very slow evolution

  constructor(baseParameters: GenerationParameters, speed: number = 0.0001) {
    this.baseParameters = { ...baseParameters }
    this.evolutionSpeed = speed
  }

  // Generate evolved parameters based on elapsed time
  getEvolvedParameters(): GenerationParameters {
    const elapsed = (Date.now() - this.startTime) * this.evolutionSpeed
    
    // Evolve complexity with sine wave
    const complexityOffset = Math.sin(elapsed * 0.5) * 0.1
    const evolvedComplexity = Math.max(0.1, Math.min(1.0, 
      this.baseParameters.complexity + complexityOffset
    ))

    // Evolve seed periodically (every 30 seconds at default speed)
    const seedCycle = Math.floor(elapsed / (30000 * this.evolutionSpeed))
    const evolvedSeed = this.baseParameters.seed + seedCycle.toString()

    // Create evolved parameters
    return {
      ...this.baseParameters,
      complexity: evolvedComplexity,
      seed: evolvedSeed
    }
  }

  // Get evolution phase (0-1 cycle)
  getEvolutionPhase(): number {
    const elapsed = (Date.now() - this.startTime) * this.evolutionSpeed
    return (elapsed % (Math.PI * 2)) / (Math.PI * 2)
  }

  // Reset evolution timer
  reset(newBaseParameters?: GenerationParameters) {
    this.startTime = Date.now()
    if (newBaseParameters) {
      this.baseParameters = { ...newBaseParameters }
    }
  }

  // Update base parameters while keeping evolution time
  updateBase(newParameters: GenerationParameters) {
    this.baseParameters = { ...newParameters }
  }

  // Set evolution speed
  setSpeed(speed: number) {
    this.evolutionSpeed = Math.max(0, speed)
  }
}

// Smooth interpolation between values
export function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

// Generate time-based noise
export function timeNoise(t: number, frequency: number = 1): number {
  return (Math.sin(t * frequency) + Math.sin(t * frequency * 1.618) * 0.5 + 
         Math.sin(t * frequency * 2.618) * 0.25) / 1.75
}

// Create breathing effect for canvas scaling
export function breathingScale(phase: number, intensity: number = 0.02): number {
  return 1 + Math.sin(phase * Math.PI * 2) * intensity
}