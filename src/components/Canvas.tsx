'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { GenerationParameters, AppTheme } from '@/app/page'
import { generateHash } from '@/lib/crypto'
import { generateLinear, generateTexture, generateGeometric } from '@/lib/generators'
import { AudioAnalyzer, type AudioFrequencyData } from '@/lib/audioAnalysis'

interface CanvasProps {
  parameters: GenerationParameters
  audioFile: File | null
  onParametersChange?: (params: Partial<GenerationParameters>) => void
  theme: AppTheme
  mobile?: boolean
}

export default function Canvas({ parameters, audioFile, onParametersChange, theme, mobile = false }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hash, setHash] = useState<string>('')
  const [audioData, setAudioData] = useState<AudioFrequencyData | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = parameters.canvasSize
    canvas.height = parameters.canvasSize

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Generate hash from parameters
    const newHash = generateHash(parameters)
    setHash(newHash)

    // Generate artwork based on pattern type
    switch (parameters.patternType) {
      case 'linear':
        generateLinear(ctx, parameters, audioData)
        break
      case 'texture':
        generateTexture(ctx, parameters, audioData)
        break
      case 'geometric':
        generateGeometric(ctx, parameters, audioData)
        break
    }
  }, [parameters, audioData])

  const [lastClickTime, setLastClickTime] = useState(0)
  const [mouseVelocity, setMouseVelocity] = useState(0)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const lastMouseTime = useRef(Date.now())

  // Audio analysis integration
  useEffect(() => {
    if (!audioFile) {
      // Clean up audio analyzer when no file
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.dispose()
        audioAnalyzerRef.current = null
      }
      setAudioData(null)
      return
    }

    // Initialize audio analyzer when audio file is present
    const initializeAnalyzer = async () => {
      const audioElement = document.querySelector('audio') as HTMLAudioElement
      if (!audioElement) return

      audioAnalyzerRef.current = new AudioAnalyzer()
      const success = await audioAnalyzerRef.current.initialize(audioElement)
      
      if (success) {
        console.log('Audio analysis initialized')
      }
    }

    initializeAnalyzer()

    return () => {
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.dispose()
        audioAnalyzerRef.current = null
      }
    }
  }, [audioFile])

  // Animation loop for movement and audio reactivity
  const animationLoop = useCallback(() => {
    if (!isAnimating && !audioFile) return

    // Get audio data if available
    if (audioAnalyzerRef.current) {
      const newAudioData = audioAnalyzerRef.current.getFrequencyData()
      if (newAudioData) {
        setAudioData(newAudioData)
      }
    }

    // Continue animation if movement is enabled or we have audio
    if (parameters.movement || audioFile) {
      animationFrameRef.current = requestAnimationFrame(animationLoop)
    }
  }, [isAnimating, audioFile, parameters.movement])

  // Start/stop animation based on movement toggle
  useEffect(() => {
    const shouldAnimate = parameters.movement || !!audioFile
    
    if (shouldAnimate && !isAnimating) {
      setIsAnimating(true)
      animationLoop()
    } else if (!shouldAnimate && isAnimating) {
      setIsAnimating(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [parameters.movement, audioFile, isAnimating, animationLoop])

  const handleCanvasClick = (e: React.MouseEvent) => {
    const now = Date.now()
    const timeDiff = now - lastClickTime
    
    // Double-click detection (within 400ms)
    if (timeDiff < 400 && onParametersChange) {
      const newSeed = Math.random().toString(36).substring(7)
      onParametersChange({ seed: newSeed })
    }
    
    setLastClickTime(now)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const now = Date.now()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Calculate velocity
    const timeDiff = now - lastMouseTime.current
    if (timeDiff > 0) {
      const distance = Math.sqrt(
        Math.pow(x - lastMousePos.current.x, 2) + 
        Math.pow(y - lastMousePos.current.y, 2)
      )
      const velocity = distance / timeDiff
      setMouseVelocity(velocity)
    }
    
    lastMousePos.current = { x, y }
    lastMouseTime.current = now
  }

  const handleExport = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a new canvas with frame and hash
    const exportCanvas = document.createElement('canvas')
    const exportCtx = exportCanvas.getContext('2d')
    if (!exportCtx) return

    const frameWidth = 32
    const totalSize = parameters.canvasSize + (frameWidth * 2)
    
    exportCanvas.width = totalSize
    exportCanvas.height = totalSize

    // Draw white frame
    exportCtx.fillStyle = '#FFFFFF'
    exportCtx.fillRect(0, 0, totalSize, totalSize)

    // Draw border
    exportCtx.strokeStyle = '#E5E5E5'
    exportCtx.lineWidth = 1
    exportCtx.strokeRect(frameWidth - 0.5, frameWidth - 0.5, parameters.canvasSize + 1, parameters.canvasSize + 1)

    // Draw main canvas content
    exportCtx.drawImage(canvas, frameWidth, frameWidth)

    // Draw hash in bottom-left corner
    exportCtx.fillStyle = '#0A0A0A'
    exportCtx.font = '10px Menlo, Monaco, monospace'
    exportCtx.fillText(hash.substring(0, 12), frameWidth + 8, totalSize - 8)

    // Download
    const link = document.createElement('a')
    link.download = `canvas-${hash.substring(0, 8)}.png`
    link.href = exportCanvas.toDataURL()
    link.click()
  }

  const sizeOptions = [256, 512, 1024]

  const canvasSize = mobile ? '280px' : '400px'

  return (
    <div className="relative">
      {/* Pure canvas - responsive and theme-aware */}
      <canvas
        ref={canvasRef}
        className={`block cursor-pointer transition-all duration-300 ${
          theme === 'black' 
            ? 'shadow-2xl shadow-gray-900/50' 
            : 'shadow-2xl shadow-gray-300/30'
        }`}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onDoubleClick={(e) => {
          const newSeed = Math.random().toString(36).substring(7)
          onParametersChange?.({ seed: newSeed })
        }}
        style={{ 
          width: canvasSize,
          height: canvasSize,
          backgroundColor: 'white'
        }}
      />
      
      {/* SHA256 hash - Theme-aware minimal display */}
      <div className={`absolute bottom-2 left-2 text-[9px] font-mono select-all transition-colors duration-300 ${
        theme === 'black' ? 'text-gray-600' : 'text-gray-300'
      }`}>
        {hash.substring(0, 8)}
      </div>
      
      {/* Export - Mobile always shows, desktop on hover */}
      <div className={`absolute ${mobile ? 'opacity-100 -bottom-6' : 'opacity-0 hover:opacity-100 -bottom-8'} left-1/2 transform -translate-x-1/2 transition-opacity duration-200`}>
        <button
          onClick={handleExport}
          className={`text-xs font-light transition-colors duration-200 ${
            theme === 'black'
              ? 'text-gray-600 hover:text-white'
              : 'text-gray-400 hover:text-black'
          }`}
        >
          save
        </button>
      </div>
    </div>
  )
}