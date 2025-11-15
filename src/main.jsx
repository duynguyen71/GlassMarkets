import React from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import App from './App'
import { SourceProvider } from './state/source'
import { ChangeWindowProvider } from './state/changeWindow'
import { NotifyProvider } from './state/notify'
import { SearchProvider } from './state/search'
import { FavoritesProvider } from './state/favorites'
import theme from './theme'
import { I18nProvider } from './i18n'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <I18nProvider>
        <SourceProvider>
          <ChangeWindowProvider>
            <NotifyProvider>
              <SearchProvider>
                  <FavoritesProvider>
                    <App />
                  </FavoritesProvider>
              </SearchProvider>
            </NotifyProvider>
          </ChangeWindowProvider>
        </SourceProvider>
      </I18nProvider>
    </ChakraProvider>
  </React.StrictMode>
)
