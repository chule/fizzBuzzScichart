import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SciChartSurface, SciChart3DSurface } from "scichart";
import './index.css'
import App from './App.tsx'

SciChartSurface.UseCommunityLicense();
SciChartSurface.loadWasmFromCDN();
SciChart3DSurface.loadWasmFromCDN();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
