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
          <div className="space-y-4">
            <div className={`text-sm font-mono ${
              theme === 'black' ? 'text-white' : 'text-black'
            }`}>
              {audioFile.name}
            </div>
            <AudioControls
              audioFile={audioFile}
              onFileChange={onFileChange}
              theme={theme}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`p-4 border-2 border-dashed rounded cursor-pointer transition-colors duration-200 ${
              theme === 'black' 
                ? 'border-gray-700 hover:border-gray-600 text-gray-500 hover:text-gray-400' 
                : 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-500'
            }`} onClick={() => (document.querySelector('#audio-input-accordion') as HTMLInputElement)?.click()}>
              <div className="text-center">
                <div className="text-sm font-mono mb-1">Drop file here</div>
                <div className="text-xs">or click to browse</div>
              </div>
            </div>
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