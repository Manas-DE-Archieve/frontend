// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Эта секция нужна для Docker, чтобы сервер был доступен извне
    host: '0.0.0.0',
    port: 3000,
    // Настраиваем прокси для всех запросов, начинающихся с /api
    proxy: {
      '/api': {
        target: 'http://backend:8000', // Адрес вашего бэкенд-сервиса в Docker
        changeOrigin: true,
      },
    },
  },
})