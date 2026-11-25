import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Rutas relativas: así funciona igual en GitHub Pages (/instituto-ingles-turnos/), Lovable o cualquier hosting.
  base: './',
})
