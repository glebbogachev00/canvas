'use client'

import { useState, useEffect, useRef } from 'react'
import Canvas from '@/components/Canvas'
import ParameterControls from '@/components/ParameterControls'
import AudioControls from '@/components/AudioControls'
import AudioAccordion from '@/components/AudioAccordion'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export type PatternType = 'linear' | 'texture' | 'geometric' | 'matrix'
export type ColorScheme = 'monochrome' | 'grayscale' | 'accent'
export type EncryptionType = 'binary' | 'hash' | 'cipher' | 'signature'
export type CornerPosition = 'topRight' | 'topLeft' | 'bottomRight'
export type AppTheme = 'white' | 'black'

export interface GenerationParameters {
  patternType: PatternType
  complexity: number
  movement: boolean
  colorScheme: ColorScheme
  seed: string
  canvasSize: number
  textInput?: string
  encryptionType: EncryptionType
  cornerPosition: CornerPosition
}

export default function Home() {
  const [parameters, setParameters] = useState<GenerationParameters>({
    patternType: 'linear',
    complexity: 0.5,
    movement: false,
    colorScheme: 'monochrome',
    seed: Math.random().toString(36).substring(7),
    canvasSize: 512,
    encryptionType: 'binary',
    cornerPosition: 'topRight'
  })

  const [audioFile, setAudioFile] = useState<File | null>(null)
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
        <h1 className={`text-sm font-light transition-colors duration-300 ${
          theme === 'black' ? 'text-white' : 'text-black'
        }`}>
          [canvas] - interactive creation
        </h1>
      </div>

      {/* Theme switcher - minimal dots in top right - desktop only */}
      <div className="absolute top-6 right-6 z-10 hidden md:block">
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('white')}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              theme === 'white' 
                ? 'bg-white shadow-lg' 
                : 'bg-gray-400 hover:bg-white opacity-50'
            }`}
          />
          <button
            onClick={() => setTheme('black')}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              theme === 'black' 
                ? 'bg-black shadow-lg' 
                : 'bg-gray-400 hover:bg-black opacity-50'
            }`}
          />
        </div>
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
          <div className="mt-8">
            <AudioAccordion
              audioFile={audioFile}
              onFileChange={setAudioFile}
              theme={theme}
            />
          </div>
        </div>

        {/* Center Panel - 60% */}
        <div className={`w-[60%] flex items-center justify-center transition-colors duration-500 ${
          theme === 'black' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <Canvas 
            ref={canvasRef}
            parameters={parameters}
            audioFile={audioFile}
            onParametersChange={updateParameters}
            theme={theme}
            showPrivateLayer={showPrivateLayer}
            onLayerToggle={setShowPrivateLayer}
          />
        </div>

        {/* Right Panel - 10% */}
        <div className="w-[10%] p-6 flex flex-col justify-end">
          {/* Reserved for future features */}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className={`p-6 border-b transition-colors duration-500 ${
          theme === 'black' ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-sm font-light ${
              theme === 'black' ? 'text-white' : 'text-black'
            }`}>
              [canvas] - interactive creation
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('white')}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  theme === 'white' 
                    ? 'bg-white shadow-lg' 
                    : 'bg-gray-400 hover:bg-white opacity-50'
                }`}
              />
              <button
                onClick={() => setTheme('black')}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  theme === 'black' 
                    ? 'bg-black shadow-lg' 
                    : 'bg-gray-400 hover:bg-black opacity-50'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Mobile Canvas - Hero */}
        <div className={`flex-1 flex items-center justify-center p-6 transition-colors duration-500 ${
          theme === 'black' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <Canvas 
            ref={canvasRef}
            parameters={parameters}
            audioFile={audioFile}
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
          
          {/* Audio in mobile controls */}
          <div className="mt-6 pt-4 border-t border-opacity-20 border-current">
            {audioFile ? (
              <AudioControls
                audioFile={audioFile}
                onFileChange={setAudioFile}
                theme={theme}
              />
            ) : (
              <>
                <button 
                  onClick={() => (document.querySelector('#audio-input') as HTMLInputElement)?.click()}
                  className={`text-xs font-light transition-colors duration-200 ${
                    theme === 'black' 
                      ? 'text-gray-600 hover:text-white' 
                      : 'text-gray-400 hover:text-black'
                  }`}
                >
                  + audio
                </button>
                <input
                  id="audio-input"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setAudioFile(file)
                  }}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}