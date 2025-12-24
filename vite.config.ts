import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  base: '/monitor/',
  server: {
    host: true, // Para que Docker lo vea
    port: 5173  // Aseguramos el puerto
  }
})
