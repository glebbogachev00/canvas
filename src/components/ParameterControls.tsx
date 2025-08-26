'use client'

import type { GenerationParameters, PatternType, ColorScheme, AppTheme, EncryptionType, CodePosition } from '@/app/page'
import AccordionContainer from './AccordionContainer'
import AccordionSection from './AccordionSection'

interface ParameterControlsProps {
  parameters: GenerationParameters
  onChange: (params: Partial<GenerationParameters>) => void
  theme: AppTheme
  mobile?: boolean
  showPrivateLayer?: boolean
  onLayerToggle?: (show: boolean) => void
}

export default function ParameterControls({ parameters, onChange, theme, mobile = false, showPrivateLayer = false, onLayerToggle }: ParameterControlsProps) {
  const updateParameter = <K extends keyof GenerationParameters>(
    key: K, 
    value: GenerationParameters[K]
  ) => {
    onChange({ [key]: value })
  }

  const regenerate = () => {
    const newSeed = Math.random().toString(36).substring(7)
    updateParameter('seed', newSeed)
  }

  return (
    <AccordionContainer theme={theme} defaultOpenSection={0} className="space-y-0">
      {/* Input Section */}
      <AccordionSection title="Input" theme={theme}>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter text..."
            value={parameters.textInput || ''}
            onChange={(e) => updateParameter('textInput', e.target.value)}
            className={`w-full bg-transparent border-b border-opacity-20 border-current pb-1 text-sm font-mono placeholder-opacity-50 focus:outline-none focus:border-opacity-40 ${
              theme === 'black' 
                ? 'text-white placeholder-gray-500' 
                : 'text-black placeholder-gray-400'
            }`}
          />
        </div>
      </AccordionSection>

      {/* Pattern Selection */}
      <AccordionSection title="Pattern" theme={theme}>
        <div className="space-y-3">
          {(['linear', 'texture', 'matrix', 'ascii'] as PatternType[]).map(type => (
            <button
              key={type}
              onClick={() => updateParameter('patternType', type)}
              className={`flex items-center text-left text-sm font-mono transition-all duration-200 ${
                parameters.patternType === type
                  ? theme === 'black' 
                    ? 'text-white' 
                    : 'text-black'
                  : theme === 'black'
                    ? 'text-gray-500 hover:text-white'
                    : 'text-gray-400 hover:text-black'
              }`}
            >
              <span className="mr-2">{parameters.patternType === type ? '●' : '○'}</span>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Style Section */}
      <AccordionSection title="Style" theme={theme}>
        <div className="space-y-4">
          {/* Color Scheme */}
          <div className="space-y-2">
            <div className={`text-xs font-mono uppercase tracking-wide ${
              theme === 'black' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Colors
            </div>
            <select
              value={parameters.colorScheme}
              onChange={(e) => updateParameter('colorScheme', e.target.value as ColorScheme)}
              className={`w-full bg-transparent border-none text-sm font-mono focus:outline-none cursor-pointer ${
                theme === 'black' 
                  ? 'text-white' 
                  : 'text-black'
              }`}
            >
              <option value="blackWhite">Black & White</option>
              <option value="grayscale">Grayscale</option>
              <option value="saturatedRed">Saturated Red</option>
            </select>
          </div>

          {/* Movement */}
          <div className="space-y-2">
            <div className={`text-xs font-mono uppercase tracking-wide ${
              theme === 'black' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Movement
            </div>
            <select
              value={parameters.movement ? 'flowing' : 'static'}
              onChange={(e) => updateParameter('movement', e.target.value === 'flowing')}
              className={`w-full bg-transparent border-none text-sm font-mono focus:outline-none cursor-pointer ${
                theme === 'black' 
                  ? 'text-white' 
                  : 'text-black'
              }`}
            >
              <option value="static">Static</option>
              <option value="flowing">Flowing</option>
            </select>
          </div>
        </div>
      </AccordionSection>

      {/* Crypto Section */}
      <AccordionSection title="Crypto" theme={theme}>
        <div className="space-y-4">
          {/* Method */}
          <div className="space-y-2">
            <div className={`text-xs font-mono uppercase tracking-wide ${
              theme === 'black' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Method
            </div>
            <select
              value={parameters.encryptionType}
              onChange={(e) => updateParameter('encryptionType', e.target.value as EncryptionType)}
              className={`w-full bg-transparent border-none text-sm font-mono focus:outline-none cursor-pointer ${
                theme === 'black' 
                  ? 'text-white' 
                  : 'text-black'
              }`}
            >
              <option value="binary">Binary</option>
              <option value="hash">Hash</option>
              <option value="cipher">Cipher</option>
              <option value="signature">Signature</option>
            </select>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <div className={`text-xs font-mono uppercase tracking-wide ${
              theme === 'black' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Position
            </div>
            <select
              value={parameters.codePosition}
              onChange={(e) => updateParameter('codePosition', e.target.value as CodePosition)}
              className={`w-full bg-transparent border-none text-sm font-mono focus:outline-none cursor-pointer ${
                theme === 'black' 
                  ? 'text-white' 
                  : 'text-black'
              }`}
            >
              <option value="topLeft">Top Left</option>
              <option value="topRight">Top Right</option>
              <option value="bottomLeft">Bottom Left</option>
              <option value="bottomRight">Bottom Right</option>
              <option value="leftEdge">Left Edge</option>
              <option value="rightEdge">Right Edge</option>
              <option value="bottomEdge">Bottom Edge</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </AccordionSection>

      {parameters.encryptionType === 'signature' && (
        <AccordionSection title="Advanced" theme={theme}>
          <div className="space-y-3">
            <button
              onClick={() => onLayerToggle?.(!showPrivateLayer)}
              className={`block text-left text-sm font-mono transition-all duration-200 ${
                showPrivateLayer
                  ? theme === 'black'
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-red-600 hover:text-red-500'
                  : theme === 'black'
                    ? 'text-green-400 hover:text-green-300'
                    : 'text-green-600 hover:text-green-500'
              }`}
            >
              {showPrivateLayer ? '[private layer]' : '[public layer]'}
            </button>
            
            <button
              onClick={regenerate}
              className={`block text-left text-sm font-mono transition-colors duration-200 ${
                theme === 'black'
                  ? 'text-gray-500 hover:text-white'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              regenerate
            </button>
          </div>
        </AccordionSection>
      )}

    </AccordionContainer>
  )
}

// Theme-aware select styles
const selectStyles = `
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
}

select option {
  background: var(--bg-color);
  color: var(--text-color);
}
`

// Inject styles once
if (typeof document !== 'undefined' && !document.querySelector('#select-styles')) {
  const styleElement = document.createElement('style')
  styleElement.id = 'select-styles'
  styleElement.textContent = selectStyles
  document.head.appendChild(styleElement)
}