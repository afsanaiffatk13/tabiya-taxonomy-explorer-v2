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
 * Get stroke width based on relation type and signalling value
 */
function getStrokeWidth(
  relationType: 'essential' | 'optional',
  signallingValue?: number
): number {
  const base = relationType === 'essential' ? 2 : 1.5;
  // Optionally scale by signalling value
  if (signallingValue !== undefined) {
    return base * (0.7 + signallingValue * 0.6);
  }
  return base;
}

/**
 * Get opacity based on connected nodes' distances
 */
function getOpacity(source: GraphNode, target: GraphNode): number {
  const maxDistance = Math.max(source.distance, target.distance);
  if (maxDistance === 2) return 0.3;
  if (maxDistance === 1) return 0.7;
  return 1;
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
  const strokeWidth = getStrokeWidth(edge.relationType, edge.signallingValue);
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
});
