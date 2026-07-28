// CipherGate Vite Configuration
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
// import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: './.vite',
  build: {
    target: 'esnext',
    minify: true,
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate chunk for WASM modules to avoid top-level await issues
          if (id.includes('onchain-runtime-v3')) return 'wasm';
          // Separate vendor chunk for MUI
          if (id.includes('node_modules/@mui/')) return 'vendor-mui';
          // Separate vendor chunk for Midnight SDK
          if (id.includes('node_modules/@midnight-ntwrk/')) return 'vendor-midnight';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
      },
    commonjsOptions: {
      // Transform CommonJS to ESM more aggressively
      transformMixedEsModules: true,
      extensions: ['.js', '.cjs'],
      // Needed for Node.js modules
      ignoreDynamicRequires: true,
    },
    assetsInlineLimit: 4096,
  },
  plugins: [
    react(),
    // Configure WASM plugin with more options
    wasm(),
    topLevelAwait({
      // Be more permissive with top-level await
      promiseExportName: '__tla',
      promiseImportName: (i) => `__tla_${i}`,
    }),
    // Custom resolver for handling problematic modules
    {
      name: 'wasm-module-resolver',
      resolveId(source, importer) {
        // Special handling for the problematic module
        if (
          source === '@midnight-ntwrk/onchain-runtime-v3' &&
          importer &&
          importer.includes('@midnight-ntwrk/compact-runtime')
        ) {
          // Force dynamic import for this case
          return {
            id: source,
            external: false,
            moduleSideEffects: true,
          };
        }
        return null;
      },
    },
  ],
  optimizeDeps: {
    rolldownOptions: {
      target: 'esnext',
      supported: { 'top-level-await': true },
      // Configure ESBuild to handle Node.js-style modules
      platform: 'browser',
      format: 'esm',
      loader: {
        '.wasm': 'binary',
      },
    },
    // Explicitly include these packages for pre-bundling, but force ESM
    include: ['@midnight-ntwrk/compact-runtime'],
    // Exclude WASM files and modules with top-level await from optimization
    exclude: [
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm.js',
    ],
  },
  define: {},
  checks: {
    importIsUndefined: false,
    pluginTimings: false,
  },
  // Add specific import configuration for more control
  resolve: {
    // Ensure WASM files are loaded properly
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.wasm'],
    mainFields: ['browser', 'module', 'main'],
  },
});
