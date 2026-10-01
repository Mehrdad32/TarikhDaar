import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/vazirmatn'
import '@fontsource-variable/noto-naskh-arabic'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (
  'serviceWorker' in navigator
  && (window.location.protocol === 'https:' || window.location.protocol === 'http:')
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('TarikhDaar service worker registration failed:', error)
    })
  })
}
