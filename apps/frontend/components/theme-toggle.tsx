"use client"

import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { theme, toggleTheme, isDark, isLight } = useTheme()

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Button
        onClick={toggleTheme}
        className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
          isDark
            ? 'bg-white text-black hover:bg-gray-100 shadow-white/20'
            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/50'
        }`}
        size="lg"
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 90, scale: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <Sun className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: -90, scale: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <Moon className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
      
      {/* Theme indicator tooltip */}
      <motion.div
        className={`absolute bottom-16 right-0 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap pointer-events-none ${
          isDark
            ? 'bg-white text-black shadow-lg'
            : 'bg-gray-900 text-white shadow-lg'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        Switch to {isDark ? 'Light' : 'Dark'} Mode
        <div className={`absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
          isDark ? 'border-t-white' : 'border-t-gray-900'
        }`} />
      </motion.div>
    </motion.div>
  )
}

// Compact theme toggle for headers/navbars
export function CompactThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`w-9 h-9 p-0 transition-all duration-200 ${
        isDark
          ? 'text-gray-300 hover:text-white hover:bg-white/5'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun-compact"
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 180, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="moon-compact"
            initial={{ rotate: 180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: -180, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
