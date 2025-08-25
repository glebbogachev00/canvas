export class AudioAnalyzer {
  private audioContext: AudioContext | null = null
  private analyserNode: AnalyserNode | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private dataArray: Uint8Array<ArrayBuffer> | null = null
  private isInitialized = false

  async initialize(audioElement: HTMLAudioElement): Promise<boolean> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume context if suspended (required for user interaction)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Create analyser node
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 256 // Good balance of detail vs performance
      this.analyserNode.smoothingTimeConstant = 0.8

      // Create source from audio element
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement)
      
      // Connect: source -> analyser -> destination
      this.sourceNode.connect(this.analyserNode)
      this.analyserNode.connect(this.audioContext.destination)

      // Create data array for frequency data
      this.dataArray = new Uint8Array(this.analyserNode.frequencyBinCount) as Uint8Array<ArrayBuffer>

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Audio analysis initialization failed:', error)
      return false
    }
  }

  getFrequencyData(): AudioFrequencyData | null {
    if (!this.analyserNode || !this.dataArray) return null

    // Get current frequency data
    this.analyserNode.getByteFrequencyData(this.dataArray)

    // Calculate useful metrics
    const bass = this.getFrequencyRange(0, 4) // Low frequencies
    const mid = this.getFrequencyRange(4, 16) // Mid frequencies  
    const treble = this.getFrequencyRange(16, 32) // High frequencies
    const volume = this.getOverallVolume()
    const beat = this.detectBeat(bass)

    return {
      raw: Array.from(this.dataArray),
      bass,
      mid, 
      treble,
      volume,
      beat,
      timestamp: Date.now()
    }
  }

  private getFrequencyRange(start: number, end: number): number {
    if (!this.dataArray) return 0
    
    let sum = 0
    for (let i = start; i < Math.min(end, this.dataArray.length); i++) {
      sum += this.dataArray[i]
    }
    return sum / (end - start) / 255 // Normalize to 0-1
  }

  private getOverallVolume(): number {
    if (!this.dataArray) return 0
    
    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i]
    }
    return sum / this.dataArray.length / 255 // Normalize to 0-1
  }

  private lastBeatTime = 0
  private beatThreshold = 0.3

  private detectBeat(bass: number): boolean {
    const now = Date.now()
    const timeSinceLastBeat = now - this.lastBeatTime
    
    // Simple beat detection: bass spike + minimum time between beats
    if (bass > this.beatThreshold && timeSinceLastBeat > 200) {
      this.lastBeatTime = now
      return true
    }
    return false
  }

  dispose() {
    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }
    if (this.analyserNode) {
      this.analyserNode.disconnect()
      this.analyserNode = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.dataArray = null
    this.isInitialized = false
  }
}

export interface AudioFrequencyData {
  raw: number[]
  bass: number
  mid: number
  treble: number
  volume: number
  beat: boolean
  timestamp: number
}