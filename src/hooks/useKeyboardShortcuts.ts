import { useEffect } from 'react'
import type { GenerationParameters, PatternType, ColorScheme } from '@/app/page'

interface UseKeyboardShortcutsProps {
  parameters: GenerationParameters
  onParametersChange: (params: Partial<GenerationParameters>) => void
  onExport?: () => void
}

export function useKeyboardShortcuts({ 
  parameters, 
  onParametersChange, 
  onExport 
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Prevent default for our shortcuts
      const shortcutKeys = ['1', '2', '3', 'q', 'w', 'e', 'r', 'm', 's', 'Space', 'Enter']
      if (shortcutKeys.includes(event.code.replace('Digit', '').replace('Key', ''))) {
        event.preventDefault()
      }

      switch (event.code) {
        // Pattern selection: 1, 2, 3
        case 'Digit1':
          onParametersChange({ patternType: 'linear' })
          break
        case 'Digit2':
          onParametersChange({ patternType: 'texture' })
          break
        case 'Digit3':
          onParametersChange({ patternType: 'geometric' })
          break

        // Color schemes: Q, W, E
        case 'KeyQ':
          onParametersChange({ colorScheme: 'monochrome' })
          break
        case 'KeyW':
          onParametersChange({ colorScheme: 'grayscale' })
          break
        case 'KeyE':
          onParametersChange({ colorScheme: 'accent' })
          break

        // Regenerate: R or Space
        case 'KeyR':
        case 'Space':
          const newSeed = Math.random().toString(36).substring(7)
          onParametersChange({ seed: newSeed })
          break

        // Movement toggle: M
        case 'KeyM':
          onParametersChange({ movement: !parameters.movement })
          break

        // Export: S (Save)
        case 'KeyS':
          if (event.metaKey || event.ctrlKey) {
            // Don't prevent browser save
            return
          }
          if (onExport) {
            onExport()
          }
          break

        // Complexity adjustment: Arrow keys
        case 'ArrowUp':
          onParametersChange({ 
            complexity: Math.min(1.0, parameters.complexity + 0.05) 
          })
          break
        case 'ArrowDown':
          onParametersChange({ 
            complexity: Math.max(0.1, parameters.complexity - 0.05) 
          })
          break

        default:
          return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [parameters, onParametersChange, onExport])

  // Show help hint on first load
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('canvas-shortcuts-seen')
    if (!hasSeenHelp) {
      console.log('Canvas Keyboard Shortcuts:')
      console.log('1-3: Pattern types | Q/W/E: Color schemes | R/Space: Regenerate')
      console.log('M: Toggle movement | S: Save | ↑↓: Adjust complexity')
      localStorage.setItem('canvas-shortcuts-seen', 'true')
    }
  }, [])
}