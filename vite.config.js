import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: resolve(__dirname, 'release'),
    rollupOptions: {
      output: {
        entryFileNames: 'assets/main.js',
      },
    },
  }
})
