import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import path from 'path';
import { defineConfig } from 'vitest/config';

import pkg from './package.json';

const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return 'unknown';
  }
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  // Base path из переменной окружения или дефолтное значение
  const basePath =
    process.env.VITE_BASE_PATH || (isProd ? '/image-editor' : '/');

  return {
    base: basePath,
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __GIT_HASH__: JSON.stringify(getGitHash()),
    },
    server: { port: 3000, open: isDev },
    build: { sourcemap: isDev },
    plugins: [
      react({
        babel: {
          babelrc: true,
          plugins: [
            [
              'effector/babel-plugin',
              { addLoc: true, debugSids: true, factories: [] },
            ],
          ],
        },
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/shared/lib/test-setup.ts',
    },
  };
});
