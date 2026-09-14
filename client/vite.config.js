import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // The API port lives in server/.env. Load it so the proxy targets the same port.
  const serverEnv = loadEnv(mode, fileURLToPath(new URL('../server', import.meta.url)), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${serverEnv.PORT || 3000}`,
          changeOrigin: true,
        },
      },
    },
  };
});
