import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Create a dedicated public folder for static assets
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  optimizeDeps: {
    // Pre-bundle these dependencies to avoid Dropbox file locking issues
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'zustand/middleware',
      'papaparse',
      'lucide-react',
    ],
    // Exclude transformers.js from optimization (it uses dynamic imports)
    exclude: ['@xenova/transformers'],
  },
  server: {
    port: 5173,
    open: true,
    // Disable file watching to avoid Dropbox issues
    watch: null,
    // Proxy HuggingFace requests to avoid CORS issues in development
    proxy: {
      '/hf-proxy': {
        target: 'https://huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hf-proxy/, ''),
        followRedirects: true,
        headers: {
          'Origin': 'https://huggingface.co',
          'Referer': 'https://huggingface.co/',
        },
      },
      '/api/resolve-cache': {
        target: 'https://huggingface.co',
        changeOrigin: true,
        followRedirects: true,
      },
      '/hf-cdn-proxy': {
        target: 'https://cdn-lfs.huggingface.co',
        changeOrigin: true,
        followRedirects: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Worker configuration for transformers.js
  worker: {
    format: 'es',
  },
});
