'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import { deepmerge } from '@mui/utils'
import { ThemeProvider, lighten, darken, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Third-party Imports
import { useMedia } from 'react-use'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '../configs/themeConfig'

// Hook Imports
import { useSettings } from '../@core/hooks/useSettings'

// Core Theme Imports
import defaultCoreTheme from '../@core/theme'

const CustomThemeProvider = props => {
  // Props
  const { children, direction, systemMode = 'light' } = props

  // Hooks
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')

  // Vars
  const isServer = typeof window === 'undefined'
  let currentMode

  if (isServer) {
    currentMode = systemMode
  } else {
    if (settings.mode === 'system') {
      currentMode = isDark ? 'dark' : 'light'
    } else {
      currentMode = settings.mode
    }
  }

  // Merge the primary color scheme override with the core theme
  const theme = useMemo(() => {
    const newTheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor, 0.2),
              dark: darken(settings.primaryColor, 0.1)
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor, 0.2),
              dark: darken(settings.primaryColor, 0.1)
            }
          }
        }
      },
      cssVariables: {
        colorSchemeSelector: 'data'
      }
    }

    const coreTheme = deepmerge(defaultCoreTheme(settings, currentMode, direction), newTheme)

    return createTheme(coreTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.primaryColor, settings.skin, currentMode])

  return (
    <ThemeProvider
      theme={theme}
      defaultMode={systemMode === 'dark' ? 'dark' : 'light'}
      modeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-template-mode`}
      forceThemeRerender
    >
      <>
        <ModeChanger systemMode={systemMode} />
        <CssBaseline />
        {children}
      </>
    </ThemeProvider>
  )
}

export default CustomThemeProvider
