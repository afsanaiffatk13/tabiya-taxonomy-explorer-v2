import { memo } from 'react';
import type { GraphNode } from './networkTypes';
import { NODE_SIZES, NODE_OPACITIES, MIN_TOUCH_TARGET } from './networkTypes';

export interface NetworkNodeProps {
  node: GraphNode;
  onNodeClick: (nodeId: string) => void;
  isHighlighted?: boolean;
}

/**
 * Get background color based on node type
 */
function getNodeBackground(node: GraphNode): string {
  if (node.distance === 0) {
    // Center node - highlighted
    return node.type === 'occupation' ? '#E4F8E2' : '#D7FFEF';
  }
  if (node.distance === 2) {
    // Faded nodes
    return '#F3F4F6';
  }
  // Distance 1 nodes
  return node.type === 'occupation' ? '#E4F8E2' : '#D7FFEF';
}

/**
 * Get border color based on node type and distance
 */
function getNodeBorder(node: GraphNode): string {
  if (node.distance === 0) {
    return '3px solid #247066';
  }
  if (node.distance === 2) {
    return '1px solid #D1D5DB';
  }
  // Distance 1
  return node.type === 'occupation' ? '2px solid #247066' : '2px solid #26B87D';
}

/**
 * A single node in the network graph
 */
export const NetworkNode = memo(function NetworkNode({
  node,
  onNodeClick,
  isHighlighted = false,
}: NetworkNodeProps) {
  const size = Math.max(NODE_SIZES[node.distance] ?? NODE_SIZES[2] ?? 40, MIN_TOUCH_TARGET);
  const opacity = NODE_OPACITIES[node.distance] ?? NODE_OPACITIES[2];

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

  // Determine if label should be visible
  const showLabel = node.distance <= 1;
  const labelSize = node.distance === 0 ? 'text-sm font-semibold' : 'text-xs';

  return (
    <div
      role="button"
      tabIndex={node.distance === 0 ? -1 : 0}
      aria-label={`${node.type}: ${node.label}${node.distance === 0 ? ' (center)' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        absolute flex items-center justify-center rounded-full
        transition-all duration-300 ease-out
        ${node.distance !== 0 ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-tabiya-green focus:ring-offset-2' : ''}
        ${isHighlighted ? 'ring-2 ring-tabiya-green ring-offset-2' : ''}
      `}
      style={{
        left: node.x - size / 2,
        top: node.y - size / 2,
        width: size,
        height: size,
        opacity,
        background: getNodeBackground(node),
        border: getNodeBorder(node),
        zIndex: node.distance === 0 ? 10 : node.distance === 1 ? 5 : 1,
      }}
    >
      {/* Node label */}
      <div
        className={`
          absolute pointer-events-none text-center
          ${showLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          transition-opacity duration-200
        `}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size - 8,
          maxHeight: size - 8,
          overflow: 'hidden',
        }}
      >
        <span
          className={`
            ${labelSize} text-oxford-blue leading-tight
            ${node.distance === 2 ? 'text-gray-500' : ''}
          `}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: node.distance === 0 ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
          }}
        >
          {node.label}
        </span>
      </div>

      {/* Type indicator dot */}
      <div
        className={`
          absolute -bottom-1 -right-1 w-4 h-4 rounded-full
          flex items-center justify-center text-[8px] font-bold
          ${node.type === 'occupation' ? 'bg-green-3 text-white' : 'bg-green-2 text-white'}
          ${node.distance === 2 ? 'opacity-50' : ''}
        `}
      >
        {node.type === 'occupation' ? 'O' : 'S'}
      </div>
    </div>
  );
});
