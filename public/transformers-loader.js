// Load Transformers.js v2.17.1 (before XetHub migration) and expose pipeline globally
// Version 2.17.2 uses HuggingFace's XetHub which has connection issues
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// CRITICAL: Disable local model loading - we don't have models locally
env.allowLocalModels = false;

// Log the env settings after configuration
console.log('Transformers.js env settings:', {
  allowLocalModels: env.allowLocalModels,
  allowRemoteModels: env.allowRemoteModels,
  remoteHost: env.remoteHost,
});

window.transformersPipeline = pipeline;
console.log('Transformers.js pipeline loaded (v2.17.1)');
