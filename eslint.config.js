import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import effector from 'eslint-plugin-effector';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      effector: fixupPluginRules(effector),
    },
    rules: {
      ...effector.configs.recommended.rules,
      ...effector.configs.scope.rules,
      ...effector.configs.react.rules,
      ...effector.configs.patronum.rules,
      ...effector.configs.future.rules,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: { react: { version: 'detect' } },
  },
  prettierConfig,
]);
