import { useRef, useState, useMemo, useEffect } from 'react';
import type { GraphNode, GraphEdge } from './networkTypes';
import { NetworkNode } from './NetworkNode';
import { NetworkEdge } from './NetworkEdge';
import { useNetworkSimulation } from './useNetworkSimulation';

// Fun loading messages like Claude's working states
const LOADING_MESSAGES = [
  'Mapping connections...',
  'Weaving the skill web...',
  'Connecting the dots...',
  'Discovering pathways...',
  'Building bridges...',
  'Tracing relationships...',
  'Untangling the network...',
  'Finding hidden links...',
];

export interface NetworkCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerNodeId: string;
  onNodeClick: (nodeId: string) => void;
  width: number;
  height: number;
  isDataLoading?: boolean;
}

interface Transform {
  x: number;
  y: number;
  k: number;
}

/**
 * Calculate transform to fit all nodes within the viewport
 */
function calculateFitTransform(
  nodes: GraphNode[],
  width: number,
  height: number
): Transform {
  if (nodes.length === 0) return { x: 0, y: 0, k: 1 };

  // Find bounding box of all nodes
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const node of nodes) {
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    // Account for node size (labels extend ~40px from center)
    const nodeRadius = 40;
    minX = Math.min(minX, x - nodeRadius);
    maxX = Math.max(maxX, x + nodeRadius);
    minY = Math.min(minY, y - nodeRadius);
    maxY = Math.max(maxY, y + nodeRadius);
  }

  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;

  // Minimal padding - just enough to not clip edges
  const padding = 20;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;
  const scaleX = availableWidth / graphWidth;
  const scaleY = availableHeight / graphHeight;
  // Allow scale up to 1.2 for smaller graphs, down as needed for large ones
  const scale = Math.min(scaleX, scaleY, 1.2);

  // Calculate translation to center
  const graphCenterX = (minX + maxX) / 2;
  const graphCenterY = (minY + maxY) / 2;
  const translateX = width / 2 - graphCenterX * scale;
  const translateY = height / 2 - graphCenterY * scale;

  return { x: translateX, y: translateY, k: scale };
}

/**
 * Canvas component that renders the network graph auto-fitted to viewport
 */
export function NetworkCanvas({
  nodes,
  edges,
  centerNodeId,
  onNodeClick,
  width,
  height,
  isDataLoading = false,
}: NetworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, forceRender] = useState(0);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [graphGeneration, setGraphGeneration] = useState(0);
  const prevCenterNodeRef = useRef(centerNodeId);
  const prevNodeCountRef = useRef(nodes.length);

  // Pick a random loading message
  const loadingMessage = useMemo(
    () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
    []
  );

  // Reset completion state when center node or node count changes
  // This must happen in useEffect to avoid state updates during render
  useEffect(() => {
    const centerChanged = centerNodeId !== prevCenterNodeRef.current;
    const countChanged = nodes.length !== prevNodeCountRef.current;

    if (centerChanged || countChanged) {
      prevCenterNodeRef.current = centerNodeId;
      prevNodeCountRef.current = nodes.length;
      setIsSimulationComplete(false);
      setGraphGeneration(g => g + 1);
    }
  }, [centerNodeId, nodes.length]);

  // Set up D3 force simulation - runs to completion INSTANTLY
  const { isRunning } = useNetworkSimulation(nodes, edges, {
    width,
    height,
    centerNodeId,
    onEnd: () => {
      // Force re-render once simulation completes to show final positions
      forceRender((k) => k + 1);
      setIsSimulationComplete(true);
    },
  });

  // Show loading when data is loading OR simulation hasn't completed
  const isLoading = isDataLoading || (nodes.length > 0 && !isSimulationComplete);

  // Calculate transform to fit all nodes in viewport
  // graphGeneration ensures recalculation after graph changes
  const transform: Transform = useMemo(() => {
    // Silence unused warning - graphGeneration triggers recalc on graph change
    void graphGeneration;
    if (!isSimulationComplete || nodes.length === 0) {
      return { x: 0, y: 0, k: 1 };
    }
    return calculateFitTransform(nodes, width, height);
  }, [isSimulationComplete, nodes, width, height, graphGeneration]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-tabiya-gray rounded-lg"
      style={{ width, height }}
    >
      {/* SVG layer for edges */}
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
      >
        <g
          transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
        >
          {edges.map((edge) => (
            <NetworkEdge key={edge.id} edge={edge} />
          ))}
        </g>
      </svg>

      {/* HTML layer for nodes (better text rendering) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transformOrigin: '0 0',
        }}
      >
        <div className="pointer-events-auto">
          {nodes.map((node) => (
            <NetworkNode
              key={node.id}
              node={node}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      </div>

      {/* Hint for interaction */}
      {!isLoading && (
        <div className="absolute top-4 right-4 text-xs text-text-muted">
          Click a node to explore
        </div>
      )}

      {/* Loading overlay */}
      {(isLoading || isRunning) && (
        <div className="absolute inset-0 flex items-center justify-center bg-tabiya-gray/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            {/* Animated dots */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-oxford-blue animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 rounded-full bg-green-3 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 rounded-full bg-oxford-blue animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {/* Loading message */}
            <p className="text-sm font-medium text-oxford-blue">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
