import { extendTheme } from '@chakra-ui/react'

const config = { initialColorMode: 'dark', useSystemColorMode: false }

const components = {
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      px: 2,
      py: 0.5,
    },
  },
  Tag: {
    baseStyle: {
      container: {
        borderRadius: 'full',
      },
    },
  },
  Heading: {
    baseStyle: {
      userSelect: 'none',
    },
  },
  Text: {
    baseStyle: {
      userSelect: 'none',
    },
  },
  Select: {
    parts: ['field', 'icon'],
    baseStyle: {
      field: { borderRadius: 'full' },
    },
  },
  Input: {
    parts: ['field', 'addon'],
    baseStyle: {
      field: { borderRadius: 'full' },
      addon: { borderRadius: 'full' },
    },
  },
}

const styles = {
  global: (props) => ({
    'html, body, #root': { height: '100%' },
    body: {
      color: props.colorMode === 'light' ? 'gray.800' : 'gray.100',
      bg: props.colorMode === 'light'
        ? 'linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%)'
        : 'linear-gradient(180deg, #0b1020 0%, #0a0f1e 100%)',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      overflowX: 'hidden',
    },
  }),
}

const shadows = {
  outline: '0 0 0 2px rgba(59,130,246,0.5)',
}

const theme = extendTheme({ config, components, styles, shadows })

export default theme
