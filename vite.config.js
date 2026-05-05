import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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