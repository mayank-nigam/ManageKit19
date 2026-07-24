// MUI Imports
import { Inter } from '@mui/material/styles' 

// Theme Options Imports
import overrides from './overrides'
import colorSchemes from './colorSchemes'
import spacing from './spacing'
import shadows from './shadows'
import customShadows from './customShadows'
import typography from './typography'

const inter = { style: { fontFamily: "'Inter', sans-serif" } }

const theme = (settings, mode, direction) => {
  return {
    direction,
    components: overrides(settings.skin),
    colorSchemes: colorSchemes(settings.skin),
    ...spacing,
    shape: {
      borderRadius: 10,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10
      }
    },
    shadows: shadows(mode),
    typography: typography(inter.style.fontFamily),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: '38 43 67',
      dark: '234 234 255',
      lightShadow: '38 43 67',
      darkShadow: '16 17 33'
    }
  }
}

export default theme
