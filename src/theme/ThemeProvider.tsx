import React, { createContext, useContext, useState, useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { colors } from './colors'
import { spacing } from './spacing'
import { typography } from './typography'

type Theme = {
  colors: typeof colors
  spacing: typeof spacing
  typography: typeof typography
  isDark: boolean
}

// Create initial theme value
const initialTheme: Theme = {
  colors,
  spacing,
  typography,
  isDark: false,
}

const ThemeContext = createContext<Theme>(initialTheme)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(colorScheme === 'dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsDark(colorScheme === 'dark')
    setMounted(true)
  }, [colorScheme])

  const theme: Theme = {
    colors,
    spacing,
    typography,
    isDark,
  }

  if (!mounted) {
    return null // or a loading indicator if you prefer
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const theme = useContext(ThemeContext)
  return theme
} 