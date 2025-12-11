// Load Transformers.js and expose pipeline globally
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
window.transformersPipeline = pipeline;
console.log('Transformers.js pipeline loaded');
