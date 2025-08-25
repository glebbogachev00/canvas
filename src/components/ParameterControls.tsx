'use client'

import type { GenerationParameters, PatternType, ColorScheme, AppTheme } from '@/app/page'

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
    <div className="space-y-12">
      {/* Pattern Type - Clean left alignment */}
      <div className="space-y-4">
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

      {/* Complexity - Properly aligned */}
      <div className="space-y-6">
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

      {/* Color - Vertical left alignment */}
      <div className="space-y-4">
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

      {/* Text to Bits - Clean alignment */}
      <div className="space-y-2">
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

      {/* Movement Toggle */}
      <div>
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

      {/* Regenerate - Left aligned */}
      <div>
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
    </div>
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