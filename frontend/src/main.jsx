import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import App from './App.jsx'
import { CasperProvider } from './context/CasperContext';
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CasperProvider>
      <App />
    </CasperProvider>
  </StrictMode>,
)
