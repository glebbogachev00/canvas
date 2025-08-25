import { useState, useEffect } from 'react'
import type { GenerationParameters } from '@/app/page'

const PRESETS_KEY = 'canvas-presets'
const LAST_PARAMS_KEY = 'canvas-last-params'

export interface Preset {
  id: string
  name: string
  parameters: GenerationParameters
  timestamp: number
}

export function useLocalStorage() {
  const [presets, setPresets] = useState<Preset[]>([])

  // Load presets on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRESETS_KEY)
      if (saved) {
        setPresets(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load presets:', error)
    }
  }, [])

  // Save presets when they change
  useEffect(() => {
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
    } catch (error) {
      console.error('Failed to save presets:', error)
    }
  }, [presets])

  const savePreset = (name: string, parameters: GenerationParameters): string => {
    const preset: Preset = {
      id: Date.now().toString(),
      name,
      parameters: { ...parameters },
      timestamp: Date.now()
    }
    
    setPresets(prev => [...prev, preset])
    return preset.id
  }

  const deletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id))
  }

  const loadPreset = (id: string): GenerationParameters | null => {
    const preset = presets.find(p => p.id === id)
    return preset ? { ...preset.parameters } : null
  }

  // Auto-save last parameters
  const saveLastParameters = (parameters: GenerationParameters) => {
    try {
      localStorage.setItem(LAST_PARAMS_KEY, JSON.stringify(parameters))
    } catch (error) {
      console.error('Failed to save last parameters:', error)
    }
  }

  const loadLastParameters = (): GenerationParameters | null => {
    try {
      const saved = localStorage.getItem(LAST_PARAMS_KEY)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load last parameters:', error)
      return null
    }
  }

  return {
    presets,
    savePreset,
    deletePreset,
    loadPreset,
    saveLastParameters,
    loadLastParameters
  }
}