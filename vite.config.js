import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/' car domaine custom (dragonland.fr).
// Si test temporaire sur <user>.github.io/<repo>, passer base à '/<repo>/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: { sourcemap: false },
})
