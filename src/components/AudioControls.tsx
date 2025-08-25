'use client'

import { useState, useRef, useEffect } from 'react'
import type { AppTheme } from '@/app/page'

interface AudioControlsProps {
  audioFile: File | null
  onFileChange: (file: File | null) => void
  theme: AppTheme
}

export default function AudioControls({ audioFile, onFileChange, theme }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration || 0)
    const handleEnd = () => setIsPlaying(false)
    const handleLoadedData = () => {
      setDuration(audio.duration || 0)
      // Reset time when new file loads
      setCurrentTime(0)
      setIsPlaying(false)
    }
    const handleError = (e: Event) => {
      console.error('Audio error:', e)
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnd)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnd)
      audio.removeEventListener('error', handleError)
    }
  }, [audioFile])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
      onFileChange(file)
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(file => file.type.startsWith('audio/'))
    
    if (audioFile) {
      handleFileSelect(audioFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const togglePlayback = async () => {
    if (!audioRef.current || !audioFile) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Audio playback failed:', error)
      setIsPlaying(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Minimal file drop - Jobs would hide complexity */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer"
      >
        <div className={`text-xs font-light transition-colors duration-200 text-center ${
          theme === 'black'
            ? 'text-gray-600 hover:text-white'
            : 'text-gray-400 hover:text-black'
        }`}>
          {audioFile ? audioFile.name.substring(0, 12) + '...' : 'drop audio'}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        className="hidden"
      />

      {/* Audio Element */}
      {audioFile && (
        <audio
          ref={audioRef}
          src={URL.createObjectURL(audioFile)}
          preload="metadata"
        />
      )}

      {/* Essential controls only - progressive disclosure */}
      {audioFile && (
        <div className="space-y-4 text-center">
          <button
            onClick={togglePlayback}
            className={`text-xs font-light transition-colors duration-200 ${
              theme === 'black'
                ? 'text-gray-600 hover:text-white'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            {isPlaying ? 'pause' : 'play'}
          </button>
          
          <button
            onClick={() => {
              onFileChange(null)
              setIsPlaying(false)
              setCurrentTime(0)
              setDuration(0)
            }}
            className={`text-xs font-light transition-colors duration-200 block ${
              theme === 'black'
                ? 'text-gray-700 hover:text-gray-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}