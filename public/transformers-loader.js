// Clear any corrupted transformers cache before loading
// This is needed because earlier failed attempts may have cached HTML responses
async function clearTransformersCache() {
  try {
    const cacheNames = await caches.keys();
    for (const name of cacheNames) {
      if (name.includes('transformers')) {
        console.log('[CACHE] Deleting corrupted cache:', name);
        await caches.delete(name);
      }
    }
    console.log('[CACHE] Cache cleared successfully');
  } catch (e) {
    console.log('[CACHE] Could not clear cache:', e);
  }
}

// Clear cache before importing transformers
await clearTransformersCache();

// Load Transformers.js and expose pipeline globally
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// CRITICAL: Disable local model loading - we don't have models locally
// This forces transformers.js to fetch from HuggingFace CDN
env.allowLocalModels = false;

// Log the env settings after configuration
console.log('Transformers.js env settings:', {
  allowLocalModels: env.allowLocalModels,
  allowRemoteModels: env.allowRemoteModels,
  remoteHost: env.remoteHost,
});

window.transformersPipeline = pipeline;
console.log('Transformers.js pipeline loaded');
