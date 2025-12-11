// Load Transformers.js and expose pipeline globally
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// CRITICAL: Disable local model loading - we don't have models locally
env.allowLocalModels = false;

// Use jsDelivr CDN for models instead of HuggingFace (more reliable)
env.remoteHost = 'https://cdn.jsdelivr.net/npm/@xenova/';
env.remotePathTemplate = '{model}/';

// Log the env settings after configuration
console.log('Transformers.js env settings:', {
  allowLocalModels: env.allowLocalModels,
  allowRemoteModels: env.allowRemoteModels,
  remoteHost: env.remoteHost,
  remotePathTemplate: env.remotePathTemplate,
});

window.transformersPipeline = pipeline;
console.log('Transformers.js pipeline loaded');
