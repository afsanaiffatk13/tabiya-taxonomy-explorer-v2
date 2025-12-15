/**
 * Semantic Search Service
 * Uses @xenova/transformers for AI-powered semantic search
 * Same stack as the original implementation
 *
 * Note: Transformers.js is loaded via script tag in index.html
 * and exposed as window.transformersPipeline (exactly like original)
 */

import pako from 'pako';

// Declare the global transformersPipeline from index.html script
declare global {
  interface Window {
    transformersPipeline?: (task: string, model: string, options?: unknown) => Promise<unknown>;
  }
}

// Wait for transformersPipeline to be available from index.html script
async function waitForTransformers(maxWaitMs = 10000): Promise<boolean> {
  const startTime = Date.now();
  while (!window.transformersPipeline) {
    if (Date.now() - startTime > maxWaitMs) {
      return false;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return true;
}

// Types for embedding data
interface EmbeddingItem {
  id: string;
  code: string;
  label: string;
  description: string;
  type: string;
  embedding: number[];
}

interface EmbeddingData {
  occupations: EmbeddingItem[];
  skills: EmbeddingItem[];
  metadata: {
    model: string;
    dimension: number;
    total_items: number;
    created: string;
  };
}

export interface SearchResult {
  id: string;
  code: string;
  label: string;
  description: string;
  type: 'occupation' | 'skill';
  similarity: number;
}

// State
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embeddingModel: any = null;
let embeddingData: EmbeddingData | null = null;
const embeddingCache = new Map<string, number[]>();

// Status tracking
export type LoadingStatus = 'idle' | 'loading-model' | 'loading-embeddings' | 'ready' | 'error';
let currentStatus: LoadingStatus = 'idle';
let statusMessage = '';
let loadProgress = 0;

// Callbacks for status updates
type StatusCallback = (status: LoadingStatus, message: string, progress: number) => void;
const statusCallbacks: StatusCallback[] = [];

export function onStatusChange(callback: StatusCallback): () => void {
  statusCallbacks.push(callback);
  // Immediately call with current status
  callback(currentStatus, statusMessage, loadProgress);
  return () => {
    const index = statusCallbacks.indexOf(callback);
    if (index > -1) statusCallbacks.splice(index, 1);
  };
}

function updateStatus(status: LoadingStatus, message: string, progress: number) {
  currentStatus = status;
  statusMessage = message;
  loadProgress = progress;
  statusCallbacks.forEach((cb) => cb(status, message, progress));
}

export function getStatus(): { status: LoadingStatus; message: string; progress: number } {
  return { status: currentStatus, message: statusMessage, progress: loadProgress };
}

export function isReady(): boolean {
  return currentStatus === 'ready';
}

/**
 * Initialize the semantic search system
 * Loads the embedding model and pre-computed embeddings
 */
export async function initializeSemanticSearch(): Promise<void> {
  if (currentStatus === 'ready' || currentStatus === 'loading-model' || currentStatus === 'loading-embeddings') {
    return; // Already initialized or initializing
  }

  try {
    // Step 1: Wait for transformers library to load from index.html script
    updateStatus('loading-model', 'Loading AI library...', 10);

    console.log('Waiting for transformers library from index.html...');
    const transformersLoaded = await waitForTransformers(15000);

    if (!transformersLoaded || !window.transformersPipeline) {
      throw new Error('Failed to load transformers library - timeout');
    }

    console.log('✓ Transformers library loaded');

    // Step 2: Load embedding model with int8 quantization (23MB instead of 90MB)
    updateStatus('loading-model', 'Loading AI model (23MB, one-time download)...', 30);

    console.log('Starting to load embedding model (int8 quantized)...');

    embeddingModel = await window.transformersPipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      { dtype: 'q8' }  // Use int8 quantization: 23MB vs 90MB full precision
    );

    console.log('✓ Embedding model loaded');
    updateStatus('loading-embeddings', 'Loading taxonomy embeddings...', 60);

    // Step 2: Load pre-computed embeddings
    // Construct URL properly - BASE_URL already has trailing slash in Vite
    const basePath = import.meta.env.BASE_URL || '/';
    const embeddingsUrl = new URL('data/embeddings.json.gz', window.location.origin + basePath).href;

    console.log('Loading embeddings from:', embeddingsUrl);

    const response = await fetch(embeddingsUrl);
    if (!response.ok) {
      throw new Error(`Failed to load embeddings: ${response.status} from ${embeddingsUrl}`);
    }

    // Check content type to ensure we got the actual file
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/html')) {
      throw new Error(`Got HTML instead of embeddings file - check that ${embeddingsUrl} exists`);
    }

    const arrayBuffer = await response.arrayBuffer();

    // Try to decompress with pako. If it fails (browser already decompressed due to Content-Encoding),
    // fall back to parsing the raw text
    let jsonString: string;
    try {
      jsonString = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
    } catch {
      // Browser already decompressed it (Content-Encoding: gzip was set)
      console.log('Embeddings already decompressed by browser, parsing directly');
      jsonString = new TextDecoder().decode(arrayBuffer);
    }
    embeddingData = JSON.parse(jsonString);

    console.log('✓ Loaded embeddings:', {
      occupations: embeddingData?.occupations.length,
      skills: embeddingData?.skills.length,
      total: embeddingData?.metadata.total_items,
    });

    updateStatus('ready', 'AI search ready!', 100);
  } catch (error) {
    console.error('Failed to initialize semantic search:', error);
    updateStatus('error', `Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`, 0);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite)
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i]!;
    const b = vecB[i]!;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  // Prevent division by zero
  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Embed a text query using the loaded model
 */
async function embedQuery(text: string): Promise<number[]> {
  if (!embeddingModel) {
    throw new Error('Embedding model not loaded');
  }

  // Check cache
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }

  // Generate embedding
  const output = await embeddingModel(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Convert to array
  const embedding = Array.from(output.data as Float32Array);

  // Cache result
  embeddingCache.set(text, embedding);

  return embedding;
}

/**
 * Search in a category (occupations or skills)
 * Filters out groups - only returns individual occupations/skills
 */
function searchInCategory(
  queryEmbedding: number[],
  items: EmbeddingItem[],
  minSimilarity: number,
  category: 'occupation' | 'skill'
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const item of items) {
    // Skip groups - only include individual occupations and skills
    if (item.type === 'group' || item.type === 'skillgroup') {
      continue;
    }

    const similarity = cosineSimilarity(queryEmbedding, item.embedding);
    if (similarity >= minSimilarity) {
      results.push({
        id: item.id,
        code: item.code,
        label: item.label,
        description: item.description,
        type: category,
        similarity,
      });
    }
  }

  return results;
}

/**
 * Perform semantic search (or fallback to keyword search if AI not available)
 */
export async function search(
  query: string,
  options: {
    minSimilarity?: number;
    maxResults?: number;
    searchOccupations?: boolean;
    searchSkills?: boolean;
  } = {}
): Promise<{ occupations: SearchResult[]; skills: SearchResult[] }> {
  const {
    minSimilarity = 0.3,
    maxResults = 50,
    searchOccupations = true,
    searchSkills = true,
  } = options;

  // If semantic search not available, use keyword search
  if (!embeddingModel || !embeddingData) {
    console.log('Using keyword search fallback');
    return keywordSearch(query, { maxResults, searchOccupations, searchSkills });
  }

  // Get query embedding
  const queryEmbedding = await embedQuery(query);

  // Search occupations
  let occupationResults: SearchResult[] = [];
  if (searchOccupations) {
    occupationResults = searchInCategory(
      queryEmbedding,
      embeddingData.occupations,
      minSimilarity,
      'occupation'
    );
    // Sort by similarity and limit
    occupationResults.sort((a, b) => b.similarity - a.similarity);
    occupationResults = occupationResults.slice(0, maxResults);
  }

  // Search skills
  let skillResults: SearchResult[] = [];
  if (searchSkills) {
    skillResults = searchInCategory(
      queryEmbedding,
      embeddingData.skills,
      minSimilarity,
      'skill'
    );
    // Sort by similarity and limit
    skillResults.sort((a, b) => b.similarity - a.similarity);
    skillResults = skillResults.slice(0, maxResults);
  }

  return {
    occupations: occupationResults,
    skills: skillResults,
  };
}

/**
 * Clear the embedding cache
 */
export function clearCache(): void {
  embeddingCache.clear();
}

/**
 * Keyword search fallback when semantic search is not available
 * Uses the loaded taxonomy data from the app store
 */
async function keywordSearch(
  query: string,
  options: {
    maxResults?: number;
    searchOccupations?: boolean;
    searchSkills?: boolean;
  }
): Promise<{ occupations: SearchResult[]; skills: SearchResult[] }> {
  const { maxResults = 50, searchOccupations = true, searchSkills = true } = options;

  // Import the store to get taxonomy data
  const { useAppStore } = await import('@/store');
  const taxonomyData = useAppStore.getState().taxonomyData;

  if (!taxonomyData) {
    return { occupations: [], skills: [] };
  }

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  const occupationResults: SearchResult[] = [];
  const skillResults: SearchResult[] = [];

  // Search occupations
  if (searchOccupations) {
    for (const [id, occ] of taxonomyData.occupations) {
      const score = calculateKeywordScore(
        queryLower,
        queryWords,
        occ.preferredLabel,
        occ.description,
        occ.altLabels
      );
      if (score > 0) {
        occupationResults.push({
          id,
          code: occ.code,
          label: occ.preferredLabel,
          description: occ.description,
          type: 'occupation',
          similarity: Math.min(score / 100, 1), // Normalize to 0-1
        });
      }
    }
  }

  // Search skills
  if (searchSkills) {
    for (const [id, skill] of taxonomyData.skills) {
      const score = calculateKeywordScore(
        queryLower,
        queryWords,
        skill.preferredLabel,
        skill.description,
        skill.altLabels
      );
      if (score > 0) {
        skillResults.push({
          id,
          code: skill.code || '',
          label: skill.preferredLabel,
          description: skill.description,
          type: 'skill',
          similarity: Math.min(score / 100, 1), // Normalize to 0-1
        });
      }
    }
  }

  // Sort by score and limit
  occupationResults.sort((a, b) => b.similarity - a.similarity);
  skillResults.sort((a, b) => b.similarity - a.similarity);

  return {
    occupations: occupationResults.slice(0, maxResults),
    skills: skillResults.slice(0, maxResults),
  };
}

/**
 * Calculate keyword match score
 */
function calculateKeywordScore(
  queryLower: string,
  queryWords: string[],
  label: string,
  description: string,
  altLabels: string[]
): number {
  const labelLower = label.toLowerCase();
  const descLower = description.toLowerCase();
  const altLower = altLabels.map(a => a.toLowerCase()).join(' ');

  let score = 0;

  // Exact match in label (highest score)
  if (labelLower.includes(queryLower)) {
    score += 100;
  }

  // Word matches in label
  for (const word of queryWords) {
    if (labelLower.includes(word)) {
      score += 30;
    }
  }

  // Word matches in alt labels
  for (const word of queryWords) {
    if (altLower.includes(word)) {
      score += 20;
    }
  }

  // Word matches in description
  for (const word of queryWords) {
    if (descLower.includes(word)) {
      score += 10;
    }
  }

  return score;
}
