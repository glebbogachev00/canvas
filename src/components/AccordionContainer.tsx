'use client'

import { useState, ReactNode, Children, cloneElement, isValidElement } from 'react'
import type { AppTheme } from '@/app/page'

interface AccordionContainerProps {
  children: ReactNode
  theme: AppTheme
  defaultOpenSection?: number
  className?: string
}

export default function AccordionContainer({ 
  children, 
  theme, 
  defaultOpenSection = 0,
  className = ""
}: AccordionContainerProps) {
  const [openSection, setOpenSection] = useState<number>(defaultOpenSection)

  const handleSectionToggle = (sectionIndex: number, shouldOpen: boolean) => {
    if (shouldOpen) {
      setOpenSection(sectionIndex)
    } else if (openSection === sectionIndex) {
      // If clicking to close the currently open section, close it
      setOpenSection(-1)
    }
  }

  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            key: index,
            controlled: true,
            isOpen: openSection === index,
            onToggle: (shouldOpen: boolean) => handleSectionToggle(index, shouldOpen),
            theme
          })
        }
        return child
      })}
    </div>
  )
}