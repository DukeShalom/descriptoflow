import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/descriptoflow/',
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: true,
  },
  define: { 'process.env': {} }
})
