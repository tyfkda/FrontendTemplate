import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import htmlMinifier from 'vite-plugin-html-minifier'

export default defineConfig({
  base: './',
  root: 'src',
  build: {
    outDir: resolve(__dirname, 'release'),
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    assetsInlineLimit: 8192,
  },
  plugins: [
    htmlMinifier({
      minify: true,
    }),
  ],
})
