'use client'

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import type { GenerationParameters, AppTheme } from '@/app/page'
import { generateHash } from '@/lib/crypto'
import { generateLinear, generateTexture, generateGeometric, generateMatrix } from '@/lib/generators'
import { CryptoEnhanced } from '@/lib/cryptoEnhanced'
import { AudioAnalyzer, type AudioFrequencyData } from '@/lib/audioAnalysis'
import CryptoDisplay from './CryptoDisplay'

interface CanvasProps {
  parameters: GenerationParameters
  audioFile: File | null
  onParametersChange?: (params: Partial<GenerationParameters>) => void
  theme: AppTheme
  mobile?: boolean
  showPrivateLayer?: boolean
  onLayerToggle?: (show: boolean) => void
}

const Canvas = forwardRef<{ handleExport?: () => void }, CanvasProps>(({ parameters, audioFile, onParametersChange, theme, mobile = false, showPrivateLayer: externalShowPrivateLayer, onLayerToggle }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hash, setHash] = useState<string>('')
  const [audioData, setAudioData] = useState<AudioFrequencyData | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  // Use external showPrivateLayer if provided, otherwise use internal state
  const showPrivateLayer = externalShowPrivateLayer ?? false
  const [layeredData, setLayeredData] = useState<any>(null)
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null)
  const animationFrameRef = useRef<number>()

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
    
    // Draw frame
    exportCtx.fillStyle = theme === 'black' ? '#000000' : '#FFFFFF'
    exportCtx.fillRect(0, 0, totalSize, totalSize)
    
    // Draw the artwork in center
    exportCtx.drawImage(canvas, frameWidth, frameWidth)
    
    // Draw hash in corner
    exportCtx.font = '10px monospace'
    exportCtx.fillStyle = theme === 'black' ? '#FFFFFF' : '#000000'
    exportCtx.fillText(hash.substring(0, 8), 8, totalSize - 8)
    
    // Download
    const link = document.createElement('a')
    link.download = `canvas-${hash.substring(0, 8)}.png`
    link.href = exportCanvas.toDataURL()
    link.click()
  }

  useImperativeHandle(ref, () => ({
    handleExport
  }))

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

    // Handle signature mode with layered rendering
    if (parameters.encryptionType === 'signature') {
      // Generate layered data for signature mode
      const layers = CryptoEnhanced.generateLayeredData(parameters)
      setLayeredData(layers)

      // Choose which layer to render based on showPrivateLayer state
      const activeLayer = showPrivateLayer ? layers.privateLayer : layers.publicLayer
      const layerParameters = {
        ...parameters,
        ...activeLayer
      }

      // Render the active layer
      switch (parameters.patternType) {
        case 'linear':
          generateLinear(ctx, layerParameters, audioData)
          break
        case 'texture':
          generateTexture(ctx, layerParameters, audioData)
          break
        case 'geometric':
          generateGeometric(ctx, layerParameters, audioData)
          break
        case 'matrix':
          generateMatrix(ctx, layerParameters, audioData)
          break
      }

      // Add layer indicator
      if (showPrivateLayer) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#FF0000'
        ctx.font = '12px monospace'
        ctx.fillText('PRIVATE LAYER', 10, canvas.height - 20)
      }
    } else {
      // Standard rendering for non-signature modes
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
        case 'matrix':
          generateMatrix(ctx, parameters, audioData)
          break
      }
    }
  }, [parameters, audioData, showPrivateLayer])

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
    
    // In signature mode, single click toggles layers
    if (parameters.encryptionType === 'signature' && onLayerToggle) {
      onLayerToggle(!showPrivateLayer)
    } else {
      // Double-click detection (within 400ms) for other modes
      if (timeDiff < 400 && onParametersChange) {
        const newSeed = Math.random().toString(36).substring(7)
        onParametersChange({ seed: newSeed })
      }
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
      
      {/* Crypto signature display - visible and bold */}
      <CryptoDisplay parameters={parameters} theme={theme} />
      
      
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
})

Canvas.displayName = 'Canvas'

export default Canvas