'use client'

import { useState, ReactNode } from 'react'
import type { AppTheme } from '@/app/page'

interface AccordionSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  theme: AppTheme
  onToggle?: (isOpen: boolean) => void
  isOpen?: boolean
  controlled?: boolean
}

export default function AccordionSection({ 
  title, 
  children, 
  defaultOpen = false, 
  theme,
  onToggle,
  isOpen: controlledIsOpen,
  controlled = false
}: AccordionSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = controlled ? controlledIsOpen : internalOpen

  const handleToggle = () => {
    if (controlled) {
      onToggle?.(!controlledIsOpen)
    } else {
      setInternalOpen(prev => {
        const newState = !prev
        onToggle?.(newState)
        return newState
      })
    }
  }

  return (
    <div className="border-b border-opacity-10 border-current">
      {/* Accordion Header */}
      <button
        onClick={handleToggle}
        className={`w-full py-4 flex items-center justify-between text-left transition-all duration-200 group ${
          theme === 'black'
            ? 'text-gray-400 hover:text-white'
            : 'text-gray-600 hover:text-black'
        }`}
      >
        <span className="text-xs font-medium uppercase tracking-wider">
          {title}
        </span>
        <div className={`transform transition-transform duration-200 ${
          isOpen ? 'rotate-90' : 'rotate-0'
        }`}>
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            className={`transition-colors duration-200 ${
              theme === 'black'
                ? 'text-gray-600 group-hover:text-white'
                : 'text-gray-400 group-hover:text-black'
            }`}
          >
            <path
              d="M2 1L6 4L2 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Accordion Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen 
          ? 'max-h-96 opacity-100 pb-6' 
          : 'max-h-0 opacity-0 pb-0'
      }`}>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}