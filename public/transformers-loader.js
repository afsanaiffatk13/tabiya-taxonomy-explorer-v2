// Debug: Intercept all fetch requests to see what URLs are being requested
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0]?.toString?.() || args[0];
  console.log('[FETCH DEBUG] Requesting:', url);
  try {
    const response = await originalFetch.apply(this, args);
    console.log('[FETCH DEBUG] Response for', url, '- Status:', response.status, 'Content-Type:', response.headers.get('content-type'));
    return response;
  } catch (error) {
    console.error('[FETCH DEBUG] Error fetching', url, ':', error);
    throw error;
  }
};

// Load Transformers.js and expose pipeline globally
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Log the env settings to see what's configured
console.log('Transformers.js env settings:', {
  backends: env.backends,
  allowLocalModels: env.allowLocalModels,
  allowRemoteModels: env.allowRemoteModels,
  localModelPath: env.localModelPath,
  remoteHost: env.remoteHost,
  remotePathTemplate: env.remotePathTemplate,
});

window.transformersPipeline = pipeline;
console.log('Transformers.js pipeline loaded');
