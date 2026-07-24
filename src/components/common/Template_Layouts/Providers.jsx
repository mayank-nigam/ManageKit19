// React Imports
import React from 'react'

// Context Imports
import { SettingsProvider } from './@core/contexts/settingsContext'
import ThemeProvider from './theme'

const Providers = props => {
  // Props
  const { children, direction } = props

  // Vars
  // Note: For React SPAs, we don't have server-side helpers like getMode().
  // Initialization will happen within the SettingsProvider's client-side logic.
  
  return (
    <SettingsProvider>
      <ThemeProvider direction={direction}>
        {children}
      </ThemeProvider>
    </SettingsProvider>
  )
}

export default Providers
