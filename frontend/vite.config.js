import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue()
  ],

  // NEXT_PUBLIC_ permite usar os nomes de variáveis sugeridos pelo painel do Supabase.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})