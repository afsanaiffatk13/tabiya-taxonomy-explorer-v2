// Debug: Intercept all fetch requests to see what URLs are being requested
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0]?.toString?.() || args[0];
  console.log('[FETCH] Requesting:', url);
  try {
    const response = await originalFetch.apply(this, args);
    const contentType = response.headers.get('content-type') || 'unknown';
    console.log('[FETCH] Response:', url, '- Status:', response.status, '- Type:', contentType);
    // Alert if we got HTML for a non-HTML request
    if (contentType.includes('text/html') && !url.includes('.html')) {
      console.error('[FETCH] WARNING: Got HTML response for non-HTML request:', url);
    }
    return response;
  } catch (error) {
    console.error('[FETCH] Error:', url, error);
    throw error;
  }
};

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
