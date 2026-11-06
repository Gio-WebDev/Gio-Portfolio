import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { createContactHandler } from './server/contact.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return {
    plugins: [
      react(),
      {
        name: 'local-contact-api',
        configureServer(server) {
          const handler = createContactHandler(env)
          server.middlewares.use((request, response, next) => {
            if (request.url?.split('?')[0] !== '/api/contact') {
              next()
              return
            }
            void handler(request, response)
          })
        },
      },
    ],
  }
})
