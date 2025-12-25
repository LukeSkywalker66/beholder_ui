import { defineConfig } from 'vite' 
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/monitor/', 
  server: {
    host: true, // <--- Esto es lo importante para Docker
    port: 5173
  }
})