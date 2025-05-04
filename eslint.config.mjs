import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // for "any" usage
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      'no-console': 'off',
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto',
        },
      ],
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'import/no-default-export': 'off',
    },
    ignores: ['node_modules', 'dist', 'coverage', '*.js', '*.d.ts', 'k8s', 'logs'],
  },
  prettierRecommended,
]
