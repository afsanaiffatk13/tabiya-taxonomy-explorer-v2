import type { GraphNode } from './networkTypes';
import { NODE_OPACITIES, MIN_TOUCH_TARGET } from './networkTypes';

export interface NetworkNodeProps {
  node: GraphNode;
  onNodeClick: (nodeId: string) => void;
  isHighlighted?: boolean;
}

/**
 * Node sizes - smaller dots since labels are now outside
 */
const DOT_SIZES: Record<number, number> = {
  0: 24,  // Center node dot
  1: 18,  // Connected nodes
  2: 12,  // Two hops away
};

/**
 * Get background color based on node type
 */
function getNodeBackground(node: GraphNode): string {
  if (node.distance === 2) {
    return '#9CA3AF'; // gray for faded
  }
  return node.type === 'occupation' ? '#247066' : '#26B87D';
}

/**
 * Get border color based on node type and distance
 */
function getNodeBorder(node: GraphNode): string {
  if (node.distance === 0) {
    return '3px solid #0D3D38';
  }
  if (node.distance === 2) {
    return '1px solid #6B7280';
  }
  return '2px solid #0D3D38';
}

/**
 * A single node in the network graph
 * Shows a colored dot with full label text below
 */
export function NetworkNode({
  node,
  onNodeClick,
  isHighlighted = false,
}: NetworkNodeProps) {
  const dotSize = DOT_SIZES[node.distance] ?? 12;
  const opacity = NODE_OPACITIES[node.distance] ?? 0.4;
  const touchTargetSize = Math.max(dotSize + 20, MIN_TOUCH_TARGET);

  // Don't render if no position
  if (node.x === undefined || node.y === undefined) {
    return null;
  }

  const handleClick = () => {
    if (node.distance !== 0) {
      onNodeClick(node.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && node.distance !== 0) {
      e.preventDefault();
      onNodeClick(node.id);
    }
  };

  // Label styling based on distance
  const isCenter = node.distance === 0;
  const isFaded = node.distance === 2;
  const maxLabelWidth = isCenter ? 140 : 120;

  return (
    <div
      role="button"
      tabIndex={isCenter ? -1 : 0}
      aria-label={`${node.type}: ${node.label}${isCenter ? ' (center)' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        absolute flex flex-col items-center
        ${!isCenter ? 'cursor-pointer focus:outline-none' : ''}
        ${isHighlighted ? 'ring-2 ring-tabiya-green ring-offset-2 rounded' : ''}
      `}
      style={{
        left: node.x,
        top: node.y,
        transform: 'translate(-50%, -50%)',
        opacity,
        zIndex: isCenter ? 10 : node.distance === 1 ? 5 : 1,
      }}
    >
      {/* Touch target area */}
      <div
        className={`
          flex flex-col items-center
          ${!isCenter ? 'hover:scale-105 transition-transform' : ''}
        `}
        style={{
          minWidth: touchTargetSize,
          minHeight: touchTargetSize,
          padding: '4px',
        }}
      >
        {/* Node dot */}
        <div
          className="rounded-full flex-shrink-0"
          style={{
            width: dotSize,
            height: dotSize,
            background: getNodeBackground(node),
            border: getNodeBorder(node),
            boxShadow: isCenter ? '0 2px 8px rgba(36, 112, 102, 0.4)' : '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />

        {/* Full label below node */}
        <div
          className={`
            mt-1 text-center leading-tight
            ${isCenter ? 'text-sm font-semibold text-oxford-blue' : ''}
            ${!isCenter && !isFaded ? 'text-xs font-medium text-oxford-blue' : ''}
            ${isFaded ? 'text-xs text-gray-500' : ''}
          `}
          style={{
            maxWidth: maxLabelWidth,
            wordBreak: 'break-word',
          }}
        >
          {node.label}
        </div>

        {/* Code (only for center node) */}
        {isCenter && (
          <div className="text-xs text-text-muted font-mono mt-0.5">
            {node.code}
          </div>
        )}

        {/* Type badge */}
        <div
          className={`
            mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide
            ${node.type === 'occupation' ? 'bg-soft-green text-green-3' : 'bg-light-green text-tabiya-green'}
            ${isFaded ? 'opacity-50' : ''}
          `}
        >
          {node.type === 'occupation' ? 'Occ' : 'Skill'}
        </div>
      </div>
    </div>
  );
}
