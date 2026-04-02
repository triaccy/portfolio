import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: '../',
  build: {
    outDir: '../wine-bottle-flipbook',
    emptyOutDir: true,
    copyPublicDir: false,
  },
})
