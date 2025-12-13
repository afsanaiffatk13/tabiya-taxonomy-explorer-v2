// Main component
export { NetworkGraph } from './NetworkGraph';
export type { NetworkGraphProps } from './NetworkGraph';

// Types
export type {
  GraphNode,
  GraphEdge,
  GraphState,
  NodeType,
  EdgeType,
  HistoryEntry,
} from './networkTypes';

// Constants
export {
  NODE_SIZES,
  NODE_OPACITIES,
  MAX_NODES,
  MIN_TOUCH_TARGET,
} from './networkTypes';

// Sub-components (for advanced usage)
export { NetworkCanvas } from './NetworkCanvas';
export { NetworkNode } from './NetworkNode';
export { NetworkEdge } from './NetworkEdge';
export { NetworkControls } from './NetworkControls';
export { NetworkLegend } from './NetworkLegend';

// Hooks
export { useNetworkData } from './useNetworkData';
export { useNetworkSimulation } from './useNetworkSimulation';
