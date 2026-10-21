import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8000'
  // A remote backend (e.g. production) only accepts its own site's Origin on the auth endpoints,
  // so the dev proxy can present that origin instead of http://localhost:5173.
  const proxyOrigin = env.VITE_API_PROXY_ORIGIN
  const proxyOptions = {
    target: apiTarget,
    changeOrigin: true,
    ...(proxyOrigin && {
      headers: { Origin: proxyOrigin },
      // Keep cookies the backend scopes to its domain usable on localhost.
      cookieDomainRewrite: '',
    }),
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // The backend allows this exact origin (CORS_ORIGINS) and checks it on the auth endpoints.
      port: 5173,
      strictPort: true,
      // Same-origin proxy: the refresh token is a SameSite=Strict, Secure, httpOnly cookie scoped to
      // /api/v1/auth, which the browser only stores and sends when the API is on the page's own origin.
      proxy: {
        '/api': proxyOptions,
        '/media': proxyOptions,
      },
    },
  }
})
