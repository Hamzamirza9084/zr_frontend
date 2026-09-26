import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://zeba-royal-backend.onrender.com', // Updated to your Render URL
        changeOrigin: true,
        secure: true, // Set to true for https  //https://zeba-royal-backend.onrender.com
      },
    },
  },
})