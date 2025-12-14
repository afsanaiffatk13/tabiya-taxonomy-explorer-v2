import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge } from './networkTypes';
import { NetworkNode } from './NetworkNode';
import { NetworkEdge } from './NetworkEdge';
import { useNetworkSimulation } from './useNetworkSimulation';

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

  // Set up D3 force simulation - runs to completion INSTANTLY
  useNetworkSimulation(nodes, edges, {
    width,
    height,
    centerNodeId,
    onEnd: () => {
      // Force re-render once simulation completes to show final positions
      forceRender((k) => k + 1);
    },
  });

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
      <div className="absolute top-4 right-4 text-xs text-text-muted">
        Click a node to explore
      </div>
    </div>
  );
}
