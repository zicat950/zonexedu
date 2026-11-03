import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // കസ്റ്റം ഡൊമെയ്‌നായതുകൊണ്ട് ഇത് '/' എന്ന് മാറ്റുക
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})