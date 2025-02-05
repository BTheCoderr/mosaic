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

const ThemeContext = createContext<Theme | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(colorScheme === 'dark')

  useEffect(() => {
    setIsDark(colorScheme === 'dark')
  }, [colorScheme])

  const theme: Theme = {
    colors,
    spacing,
    typography,
    isDark,
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const theme = useContext(ThemeContext)
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return theme
} 