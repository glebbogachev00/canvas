'use client'

import { ReactNode } from 'react'
import type { AppTheme } from '@/app/page'
import AccordionContainer from './AccordionContainer'
import AccordionSection from './AccordionSection'
import AudioControls from './AudioControls'

interface AudioAccordionProps {
  audioFile: File | null
  onFileChange: (file: File | null) => void
  theme: AppTheme
}

export default function AudioAccordion({ audioFile, onFileChange, theme }: AudioAccordionProps) {
  return (
    <AccordionContainer theme={theme} defaultOpenSection={audioFile ? 0 : -1} className="space-y-0">
      {/* Audio Section */}
      <AccordionSection title="Audio" theme={theme}>
        {audioFile ? (
          <AudioControls
            audioFile={audioFile}
            onFileChange={onFileChange}
            theme={theme}
          />
        ) : (
          <div className="space-y-3">
            <button 
              onClick={() => (document.querySelector('#audio-input-accordion') as HTMLInputElement)?.click()}
              className={`text-xs font-light transition-colors duration-200 ${
                theme === 'black' 
                  ? 'text-gray-600 hover:text-white' 
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              + upload audio
            </button>
            <input
              id="audio-input-accordion"
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onFileChange(file)
              }}
              className="hidden"
            />
          </div>
        )}
      </AccordionSection>
    </AccordionContainer>
  )
}