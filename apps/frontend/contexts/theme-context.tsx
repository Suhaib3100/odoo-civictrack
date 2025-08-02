"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
  isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('civictrack-theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    
    setTheme(initialTheme)
    setMounted(true)
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('civictrack-theme', newTheme)
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-black">{children}</div>
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-black text-white' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme-aware utility functions
export const getThemeClasses = (theme: Theme) => ({
  // Backgrounds
  bg: {
    primary: theme === 'dark' ? 'bg-black' : 'bg-white',
    secondary: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100',
    tertiary: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200',
    card: theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white',
    hover: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50',
    accent: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50',
  },
  
  // Text colors
  text: {
    primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
    secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    tertiary: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    muted: theme === 'dark' ? 'text-gray-500' : 'text-gray-400',
    accent: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
  },
  
  // Borders
  border: {
    primary: theme === 'dark' ? 'border-white/10' : 'border-gray-200',
    secondary: theme === 'dark' ? 'border-gray-800' : 'border-gray-300',
    accent: theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200',
  },
  
  // Buttons
  button: {
    primary: theme === 'dark' 
      ? 'bg-white text-black hover:bg-gray-100' 
      : 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: theme === 'dark'
      ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700'
      : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-300',
    ghost: theme === 'dark'
      ? 'text-gray-300 hover:bg-white/5 hover:text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  },
  
  // Status colors (consistent across themes but with theme-appropriate opacity)
  status: {
    success: theme === 'dark' ? 'text-green-400 bg-green-500/15' : 'text-green-600 bg-green-50',
    warning: theme === 'dark' ? 'text-yellow-400 bg-yellow-500/15' : 'text-yellow-600 bg-yellow-50',
    error: theme === 'dark' ? 'text-red-400 bg-red-500/15' : 'text-red-600 bg-red-50',
    info: theme === 'dark' ? 'text-blue-400 bg-blue-500/15' : 'text-blue-600 bg-blue-50',
  }
})

// CSS variables for dynamic theming
export const themeVariables = {
  light: {
    '--bg-primary': '255 255 255',
    '--bg-secondary': '249 250 251',
    '--bg-tertiary': '229 231 235',
    '--text-primary': '17 24 39',
    '--text-secondary': '75 85 99',
    '--text-tertiary': '107 114 128',
    '--border-primary': '229 231 235',
    '--border-secondary': '209 213 219',
    '--accent-primary': '59 130 246',
    '--accent-secondary': '147 197 253',
  },
  dark: {
    '--bg-primary': '0 0 0',
    '--bg-secondary': '17 24 39',
    '--bg-tertiary': '31 41 55',
    '--text-primary': '255 255 255',
    '--text-secondary': '209 213 219',
    '--text-tertiary': '156 163 175',
    '--border-primary': '55 65 81',
    '--border-secondary': '75 85 99',
    '--accent-primary': '96 165 250',
    '--accent-secondary': '59 130 246',
  }
}
