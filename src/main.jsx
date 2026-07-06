import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from './i18n/index.jsx'
import App from './App.jsx'
import '@fontsource/noto-sans-tc/400.css'
import '@fontsource/noto-sans-tc/600.css'
import '@fontsource/noto-sans-tc/700.css'
import '@fontsource/noto-sans-sc/400.css'
import '@fontsource/noto-sans-sc/600.css'
import '@fontsource/noto-sans-sc/700.css'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>
)