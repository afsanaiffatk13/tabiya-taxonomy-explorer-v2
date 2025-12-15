import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
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
}

interface Transform {
  x: number;
  y: number;
  k: number;
}

/**
 * Canvas component that renders the network graph with zoom/pan support
 */
export function NetworkCanvas({
  nodes,
  edges,
  centerNodeId,
  onNodeClick,
  width,
  height,
}: NetworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const [, forceRender] = useState(0);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const prevNodeCountRef = useRef(0);

  // Pick a random loading message
  const loadingMessage = useMemo(
    () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
    []
  );

  // Reset completion state when nodes change significantly
  if (nodes.length !== prevNodeCountRef.current) {
    prevNodeCountRef.current = nodes.length;
    if (nodes.length > 0 && isSimulationComplete) {
      setIsSimulationComplete(false);
    }
  }

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

  // Show loading when we have nodes but simulation hasn't completed yet
  const isLoading = nodes.length > 0 && !isSimulationComplete;

  // Set up zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k,
        });
      });

    svg.call(zoomBehavior);

    // Double-click to reset zoom
    svg.on('dblclick.zoom', () => {
      svg
        .transition()
        .duration(300)
        .call(zoomBehavior.transform, d3.zoomIdentity);
    });

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-tabiya-gray rounded-lg"
      style={{ width, height }}
    >
      {/* SVG layer for edges */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ touchAction: 'none' }}
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
