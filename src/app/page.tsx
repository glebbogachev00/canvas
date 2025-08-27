'use client'

import { useState, useEffect, useRef } from 'react'
import Canvas from '@/components/Canvas'
import ParameterControls from '@/components/ParameterControls'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export type PatternType = 'linear' | 'texture' | 'matrix' | 'ascii'
export type ColorScheme = 'blackWhite' | 'grayscale' | 'saturatedRed'
export type EncryptionType = 'binary' | 'hash' | 'cipher' | 'signature'
export type CodePosition = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'leftEdge' | 'rightEdge' | 'bottomEdge' | 'none'
export type AppTheme = 'white' | 'black'

export interface GenerationParameters {
  patternType: PatternType
  colorScheme: ColorScheme
  seed: string
  canvasSize: number
  textInput?: string
  encryptionType: EncryptionType
  codePosition: CodePosition
  movement?: boolean
  complexity?: number
}

export default function Home() {
  const [parameters, setParameters] = useState<GenerationParameters>({
    patternType: 'linear',
    colorScheme: 'blackWhite',
    seed: Math.random().toString(36).substring(7),
    canvasSize: 512,
    encryptionType: 'binary',
    codePosition: 'bottomLeft'
  })

  const [theme, setTheme] = useState<AppTheme>('white')
  const [showPrivateLayer, setShowPrivateLayer] = useState(false)
  const canvasRef = useRef<any>(null)

  const updateParameters = (newParams: Partial<GenerationParameters>) => {
    setParameters(prev => ({ ...prev, ...newParams }))
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    parameters,
    onParametersChange: updateParameters,
    onExport: () => canvasRef.current?.handleExport?.()
  })

  return (
    <main className={`min-h-screen transition-colors duration-500 ${
      theme === 'black' 
        ? 'bg-black text-white' 
        : 'bg-white text-black'
    }`}>
      
      {/* App title - matching design language - desktop only */}
      <div className="absolute top-6 left-6 z-10 hidden md:block">
        <h1 className={`text-sm font-mono transition-colors duration-300 ${
          theme === 'black' ? 'text-white' : 'text-black'
        }`}>
          [canvas] - interactive creation
        </h1>
      </div>

      {/* Theme switcher - toggle style in top right - desktop only */}
      <div className="absolute top-6 right-6 z-10 hidden md:block">
        <button
          onClick={() => setTheme(theme === 'white' ? 'black' : 'white')}
          className={`text-sm font-mono transition-all duration-300 ${
            theme === 'black' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'
          }`}
        >
          [{theme}]
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Panel - 30% */}
        <div className="w-[30%] p-12 flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
            <ParameterControls 
              parameters={parameters}
              onChange={updateParameters}
              theme={theme}
              showPrivateLayer={showPrivateLayer}
              onLayerToggle={setShowPrivateLayer}
            />
          </div>
        </div>

        {/* Canvas Panel - 70% */}
        <div className={`w-[70%] flex items-center justify-center transition-colors duration-500 ${
          theme === 'black' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <Canvas 
            ref={canvasRef}
            parameters={parameters}
            onParametersChange={updateParameters}
            theme={theme}
            showPrivateLayer={showPrivateLayer}
            onLayerToggle={setShowPrivateLayer}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className={`p-6 border-b transition-colors duration-500 ${
          theme === 'black' ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-sm font-mono ${
              theme === 'black' ? 'text-white' : 'text-black'
            }`}>
              [canvas] - interactive creation
            </h1>
            <button
              onClick={() => setTheme(theme === 'white' ? 'black' : 'white')}
              className={`text-xs font-mono transition-all duration-300 ${
                theme === 'black' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'
              }`}
            >
              [{theme}]
            </button>
          </div>
        </div>

        {/* Mobile Canvas - Hero */}
        <div className={`flex-1 flex items-center justify-center p-6 transition-colors duration-500 ${
          theme === 'black' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <Canvas 
            ref={canvasRef}
            parameters={parameters}
            onParametersChange={updateParameters}
            theme={theme}
            mobile={true}
            showPrivateLayer={showPrivateLayer}
            onLayerToggle={setShowPrivateLayer}
          />
        </div>

        {/* Mobile Controls - Bottom sheet style */}
        <div className={`p-6 transition-colors duration-500 ${
          theme === 'black' ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        } border-t`}>
          <ParameterControls 
            parameters={parameters}
            onChange={updateParameters}
            theme={theme}
            mobile={true}
            showPrivateLayer={showPrivateLayer}
            onLayerToggle={setShowPrivateLayer}
          />
        </div>
      </div>
    </main>
  )
}