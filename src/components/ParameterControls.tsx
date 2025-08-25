'use client'

import type { GenerationParameters, PatternType, ColorScheme, AppTheme, EncryptionType, CornerPosition } from '@/app/page'
import AccordionContainer from './AccordionContainer'
import AccordionSection from './AccordionSection'

interface ParameterControlsProps {
  parameters: GenerationParameters
  onChange: (params: Partial<GenerationParameters>) => void
  theme: AppTheme
  mobile?: boolean
}

export default function ParameterControls({ parameters, onChange, theme, mobile = false }: ParameterControlsProps) {
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
      {/* Pattern Selection */}
      <AccordionSection title="Pattern" theme={theme}>
        <div className="space-y-3">
          {(['linear', 'texture', 'geometric'] as PatternType[]).map(type => (
            <button
              key={type}
              onClick={() => updateParameter('patternType', type)}
              className={`block text-left text-sm transition-all duration-200 ${
                parameters.patternType === type
                  ? theme === 'black' 
                    ? 'text-white font-medium' 
                    : 'text-black font-medium'
                  : theme === 'black'
                    ? 'text-gray-500 hover:text-white font-light'
                    : 'text-gray-400 hover:text-black font-light'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Encryption */}
      <AccordionSection title="Encryption" theme={theme}>
        <div className="space-y-3">
          {(['binary', 'hash', 'cipher', 'signature'] as EncryptionType[]).map(type => (
            <button
              key={type}
              onClick={() => updateParameter('encryptionType', type)}
              className={`block text-left text-sm transition-all duration-200 ${
                parameters.encryptionType === type
                  ? theme === 'black' 
                    ? 'text-white font-medium' 
                    : 'text-black font-medium'
                  : theme === 'black'
                    ? 'text-gray-500 hover:text-white font-light'
                    : 'text-gray-400 hover:text-black font-light'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Parameters */}
      <AccordionSection title="Parameters" theme={theme}>
        <div className="space-y-6">
          {/* Complexity */}
          <div className="space-y-3">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={parameters.complexity}
              onChange={(e) => updateParameter('complexity', parseFloat(e.target.value))}
              className={`w-full h-px appearance-none cursor-pointer focus:outline-none complexity-slider ${
                theme === 'black' ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            />
            <div className={`text-xs font-light ${
              theme === 'black' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {parameters.complexity < 0.3 ? 'minimal' : parameters.complexity < 0.7 ? 'balanced' : 'complex'}
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-3">
            {(['monochrome', 'grayscale', 'accent'] as ColorScheme[]).map(scheme => (
              <button
                key={scheme}
                onClick={() => updateParameter('colorScheme', scheme)}
                className={`block text-left text-xs transition-all duration-200 ${
                  parameters.colorScheme === scheme
                    ? theme === 'black' 
                      ? 'text-white font-medium' 
                      : 'text-black font-medium'
                    : theme === 'black'
                      ? 'text-gray-500 hover:text-white font-light'
                      : 'text-gray-400 hover:text-black font-light'
                }`}
              >
                {scheme === 'monochrome' ? 'mono' : scheme === 'grayscale' ? 'gray' : 'color'}
              </button>
            ))}
          </div>

          {/* Corner Position */}
          <div className="space-y-3">
            <div className={`text-xs font-light ${
              theme === 'black' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              code position
            </div>
            {(['topRight', 'topLeft', 'bottomRight'] as CornerPosition[]).map(position => (
              <button
                key={position}
                onClick={() => updateParameter('cornerPosition', position)}
                className={`block text-left text-xs transition-all duration-200 ${
                  parameters.cornerPosition === position
                    ? theme === 'black' 
                      ? 'text-white font-medium' 
                      : 'text-black font-medium'
                    : theme === 'black'
                      ? 'text-gray-500 hover:text-white font-light'
                      : 'text-gray-400 hover:text-black font-light'
                }`}
              >
                {position === 'topRight' ? 'top-right' : position === 'topLeft' ? 'top-left' : 'bottom-right'}
              </button>
            ))}
          </div>

          {/* Movement */}
          <button
            onClick={() => updateParameter('movement', !parameters.movement)}
            className={`block text-left text-xs transition-all duration-200 ${
              parameters.movement
                ? theme === 'black' 
                  ? 'text-white font-medium' 
                  : 'text-black font-medium'
                : theme === 'black'
                  ? 'text-gray-500 hover:text-white font-light'
                  : 'text-gray-400 hover:text-black font-light'
            }`}
          >
            {parameters.movement ? 'flowing' : 'static'}
          </button>
        </div>
      </AccordionSection>

      {/* Input */}
      <AccordionSection title="Input" theme={theme}>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="enter text to encode..."
            value={parameters.textInput || ''}
            onChange={(e) => updateParameter('textInput', e.target.value)}
            className={`w-full bg-transparent border-none text-xs font-light placeholder-opacity-50 focus:outline-none ${
              theme === 'black' 
                ? 'text-white placeholder-gray-600' 
                : 'text-black placeholder-gray-400'
            }`}
          />
          <div className={`text-xs font-light ${
            theme === 'black' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {parameters.textInput ? `${(parameters.textInput.length * 8)} bits` : 'binary data'}
          </div>
        </div>
      </AccordionSection>

      {/* Actions */}
      <AccordionSection title="Actions" theme={theme}>
        <div className="space-y-3">
          <button
            onClick={regenerate}
            className={`block text-left text-xs font-light transition-colors duration-200 ${
              theme === 'black'
                ? 'text-gray-500 hover:text-white'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            regenerate
          </button>
        </div>
      </AccordionSection>
    </AccordionContainer>
  )
}

// Theme-aware minimal slider styles
const sliderStyles = `
.complexity-slider::-webkit-slider-thumb {
  appearance: none;
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background: currentColor;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.complexity-slider:hover::-webkit-slider-thumb {
  height: 12px;
  width: 12px;
}

.complexity-slider::-moz-range-thumb {
  appearance: none;
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background: currentColor;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
`

// Inject styles once
if (typeof document !== 'undefined' && !document.querySelector('#complexity-slider-styles')) {
  const styleElement = document.createElement('style')
  styleElement.id = 'complexity-slider-styles'
  styleElement.textContent = sliderStyles
  document.head.appendChild(styleElement)
}