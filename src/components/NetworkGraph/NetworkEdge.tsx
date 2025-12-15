import type { GraphEdge, GraphNode } from './networkTypes';

export interface NetworkEdgeProps {
  edge: GraphEdge;
}

/**
 * Get stroke color based on relation type
 */
function getStrokeColor(relationType: 'essential' | 'optional'): string {
  return relationType === 'essential' ? '#247066' : '#9CA3AF';
}

/**
 * Get stroke width based on distance - thicker for inner connections
 */
function getStrokeWidth(source: GraphNode, target: GraphNode): number {
  const maxDistance = Math.max(source.distance, target.distance);
  if (maxDistance <= 1) return 1.5;  // Distance 0-1: thicker
  if (maxDistance === 2) return 0.8;
  return 0.5;  // Distance 3: thinnest
}

/**
 * Get opacity based on connected nodes' distances - more transparent for outer
 */
function getOpacity(source: GraphNode, target: GraphNode): number {
  const maxDistance = Math.max(source.distance, target.distance);
  if (maxDistance <= 1) return 0.6;   // Distance 0-1: visible
  if (maxDistance === 2) return 0.15; // Distance 2: quite transparent
  return 0.08;  // Distance 3: very transparent
}

/**
 * A single edge (connection) between two nodes
 * Note: Not using memo() because D3 mutates source/target node positions directly
 */
export function NetworkEdge({ edge }: NetworkEdgeProps) {
  // D3 mutates source/target to be node objects, not strings
  const source = edge.source as GraphNode;
  const target = edge.target as GraphNode;

  // Don't render if nodes don't have positions
  if (
    source.x === undefined ||
    source.y === undefined ||
    target.x === undefined ||
    target.y === undefined
  ) {
    return null;
  }

  const strokeColor = getStrokeColor(edge.relationType);
  const strokeWidth = getStrokeWidth(source, target);
  const opacity = getOpacity(source, target);

  // Dash array for optional relations
  const strokeDasharray = edge.relationType === 'optional' ? '6 4' : undefined;

  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      opacity={opacity}
      className="transition-opacity duration-300"
    />
  );
}
