/**
 * Type definitions for the Network Graph visualization
 */

export type NodeType = 'occupation' | 'skill';
export type EdgeType = 'essential' | 'optional';

/**
 * A node in the network graph representing an occupation or skill
 */
export interface GraphNode {
  id: string;
  code: string;
  label: string;
  type: NodeType;
  /** Distance from center: 0=center, 1=connected, 2=two hops away */
  distance: number;
  /** Signalling value from relation (0-1), used for sizing */
  signallingValue?: number;
  /** D3 simulation position */
  x?: number;
  y?: number;
  /** D3 simulation velocity */
  vx?: number;
  vy?: number;
  /** Fixed position (for center node) */
  fx?: number | null;
  fy?: number | null;
}

/**
 * An edge connecting two nodes in the network
 */
export interface GraphEdge {
  id: string;
  /** Source node ID or node reference (D3 mutates this) */
  source: string | GraphNode;
  /** Target node ID or node reference (D3 mutates this) */
  target: string | GraphNode;
  /** Type of relation */
  relationType: EdgeType;
  /** Signalling value for edge weight */
  signallingValue?: number;
}

/**
 * Complete state of the network graph
 */
export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerNodeId: string;
  centerNodeType: NodeType;
  /** Navigation history for breadcrumb */
  history: HistoryEntry[];
}

/**
 * An entry in the navigation history
 */
export interface HistoryEntry {
  id: string;
  label: string;
  type: NodeType;
}

/**
 * Props for the main NetworkGraph component
 */
export interface NetworkGraphProps {
  initialNode: {
    id: string;
    type: NodeType;
    label: string;
    code: string;
  };
  onClose: () => void;
}

/**
 * Node size configuration by distance
 */
export const NODE_SIZES: Record<number, number> = {
  0: 80,  // Center node
  1: 56,  // Connected nodes
  2: 40,  // Two hops away
};

/**
 * Node opacity by distance
 */
export const NODE_OPACITIES: Record<number, number> = {
  0: 1,
  1: 1,
  2: 0.4,
};

/**
 * Maximum number of nodes to display
 */
export const MAX_NODES = 60;

/**
 * Minimum touch target size for accessibility
 */
export const MIN_TOUCH_TARGET = 44;
