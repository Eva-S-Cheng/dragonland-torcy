import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base temporaire pour le déploiement de test sur eva-s-cheng.github.io/dragonland-torcy/
// ⚠️ Repasser à base: '/' quand dragonland.fr sera branché (+ ajouter public/CNAME).
export default defineConfig({
  plugins: [react()],
  base: '/dragonland-torcy/',
  build: { sourcemap: false },
})