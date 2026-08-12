import {defineConfig} from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import playwright from 'eslint-plugin-playwright'

export default defineConfig(
    {
        ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'app/'],
    },
    {
        files: ['**/*.ts'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
    },
    {
        files: ['e2e/**/*.ts'],
        ...playwright.configs['flat/recommended'],
        rules: {
            'playwright/expect-expect': ['error', {assertFunctionPatterns: ['^verify.*']}],
        },
    },
    {
        files: ['scripts/**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                module: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                console: 'readonly',
            },
        },
    },
)
