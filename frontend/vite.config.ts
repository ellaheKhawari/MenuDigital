import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // با XAMPP: Virtual Host (مثلاً cafe.test) که DocumentRoot اش پوشه‌ی backend/ است
    // یا: php -S 127.0.0.1:8080 -t backend backend/tests/dev-router.php  (آدرس را عوض کن)
    proxy: {
      '/api': { target: 'http://cafe.test', changeOrigin: true },
      '/uploads': { target: 'http://cafe.test', changeOrigin: true },
    },
  },
})
