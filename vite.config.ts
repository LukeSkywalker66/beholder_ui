import { defineConfig } from 'vite' // <--- ESTO ES OBLIGATORIO
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/monitor/', 
  server: {
    host: true,
    port: 5173
  }
})