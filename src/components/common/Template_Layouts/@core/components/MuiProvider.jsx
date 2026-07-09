'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Hook Imports
import { useSettings } from '../hooks/useSettings'

// Theme Imports
import themeOptions from '../theme'

const MuiProvider = ({ children }) => {
  // Hooks
  const { settings } = useSettings()

  // Vars
  const theme = useMemo(() => {
    // Safety check: if settings is not available, return null
    if (!settings) {
      console.warn('MuiProvider: settings is undefined. Context might not be initialized yet.');
      return null
    }

    // Determine the actual mode (light/dark)
    const mode = (settings && settings.mode) ? (
      settings.mode === 'system' 
        ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
        : settings.mode
    ) : 'light';

    const direction = 'ltr' // Default to LTR

    // Create the theme object from options
    try {
      const themeJson = themeOptions(settings || {}, mode, direction)
      return createTheme(themeJson)
    } catch (e) {
      console.error('MuiProvider: Failed to create theme', e);
      return null;
    }
  }, [settings])

  if (!theme) {
    return <>{children}</>; // Return children without MUI theme if theme creation fails
  }

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline helps normalize styles but might affect the rest of the app */}
      {/* For scoped UI, we might skip it or keep it limited */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default MuiProvider
