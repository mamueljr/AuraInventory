import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
    },
    rules: {
      // Reglas de capas (ver docs/ARCHITECTURE.md §3):
      // cada zona lista qué le está PROHIBIDO importar.
      'import/no-restricted-paths': [
        'error',
        {
          basePath: './src',
          zones: [
            // domain es puro: no importa de ninguna otra capa
            { target: './domain', from: '.', except: ['./domain'] },
            // data solo conoce domain (y utils genéricos)
            { target: './data', from: '.', except: ['./data', './domain', './utils'] },
            // application orquesta domain + data
            {
              target: './application',
              from: '.',
              except: ['./application', './domain', './data', './utils', './config'],
            },
            // design-system es genérico: no conoce el dominio ni las features
            {
              target: './design-system',
              from: '.',
              except: ['./design-system', './utils', './assets'],
            },
            // la UI nunca toca la persistencia directamente
            {
              target: ['./features', './pages', './layouts', './stores'],
              from: './data',
            },
          ],
        },
      ],
    },
  },
  {
    // Los tests pueden romper las reglas de capas para preparar escenarios
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: { 'import/no-restricted-paths': 'off' },
  },
)
