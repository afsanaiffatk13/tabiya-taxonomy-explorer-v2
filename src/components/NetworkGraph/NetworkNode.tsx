import { useState } from 'react';
import type { GraphNode } from './networkTypes';
import { MIN_TOUCH_TARGET } from './networkTypes';

export interface NetworkNodeProps {
  node: GraphNode;
  onNodeClick: (nodeId: string) => void;
  isHighlighted?: boolean;
}

/**
 * Node colors by type and distance
 * Occupations: shades of Oxford Blue
 * Skills: shades of Tabiya Green
 */
const NODE_COLORS: Record<string, Record<number, string>> = {
  occupation: {
    0: '#002147', // Oxford Blue - center (darkest)
    1: '#0a3a6b', // Lighter blue
    2: '#1a5490', // Even lighter
    3: '#2a6eb5', // Lightest blue
  },
  skill: {
    0: '#1a8a5c', // Darker green - center
    1: '#26B87D', // Tabiya Green
    2: '#3fcf96', // Lighter green
    3: '#5ee0ad', // Lightest green
  },
};

/**
 * Get node color based on type and distance
 */
function getNodeColor(node: GraphNode): string {
  const colorsByDistance = NODE_COLORS[node.type];
  if (!colorsByDistance) {
    return '#26B87D'; // Default to Tabiya Green
  }
  return colorsByDistance[node.distance] ?? colorsByDistance[1] ?? '#26B87D';
}

/**
 * Calculate node size based on distance only
 */
function getNodeSize(node: GraphNode): number {
  const sizeByDistance: Record<number, number> = {
    0: 32,  // Center node (largest)
    1: 18,  // Distance 1
    2: 12,  // Distance 2
    3: 8,   // Distance 3 (smallest)
  };

  return sizeByDistance[node.distance] ?? 10;
}

/**
 * Determine if label should be shown
 * Distance 0 and 1 show labels, others show on hover
 */
function shouldShowLabel(
  node: GraphNode,
  isHovered: boolean
): boolean {
  // Always show labels for center and distance 1
  if (node.distance <= 1) return true;

  // Show on hover only for distance 2+
  if (isHovered) return true;

  return false;
}

/**
 * A single node in the network graph
 * Clean design: colored dot with optional name label
 */
export function NetworkNode({
  node,
  onNodeClick,
  isHighlighted = false,
}: NetworkNodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const dotSize = getNodeSize(node);
  const touchTargetSize = Math.max(dotSize + 16, MIN_TOUCH_TARGET);
  const showLabel = shouldShowLabel(node, isHovered);

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

  const isCenter = node.distance === 0;
  const nodeColor = getNodeColor(node);

  // Opacity based on distance - much more transparent for outer rings
  const opacityByDistance: Record<number, number> = {
    0: 1,
    1: 1,
    2: 0.4,
    3: 0.25,
  };
  const opacity = opacityByDistance[node.distance] ?? 0.25;

  return (
    <div
      role="button"
      tabIndex={isCenter ? -1 : 0}
      aria-label={`${node.type}: ${node.label}${isCenter ? ' (center)' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        absolute flex flex-col items-center
        ${!isCenter ? 'cursor-pointer focus:outline-none' : ''}
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
          ${!isCenter ? 'hover:scale-110 transition-transform duration-150' : ''}
        `}
        style={{
          minWidth: touchTargetSize,
          minHeight: touchTargetSize,
          padding: '4px',
        }}
      >
        {/* Node dot - clean circle, no border */}
        <div
          className="rounded-full flex-shrink-0"
          style={{
            width: dotSize,
            height: dotSize,
            background: nodeColor,
            boxShadow: isCenter
              ? '0 2px 8px rgba(0, 33, 71, 0.3)'
              : isHovered
                ? '0 2px 6px rgba(0, 0, 0, 0.2)'
                : 'none',
          }}
        />

        {/* Label - only name, shown conditionally */}
        {showLabel && (
          <div
            className={`
              mt-1.5 text-center leading-tight
              ${isCenter ? 'text-sm font-semibold' : 'text-xs font-medium'}
              text-gray-800
            `}
            style={{
              maxWidth: isCenter ? 140 : 100,
              wordBreak: 'break-word',
            }}
          >
            {node.label}
          </div>
        )}
      </div>

      {/* Tooltip for nodes without visible label */}
      {!showLabel && isHovered && (
        <div
          className="absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap"
          style={{
            bottom: '100%',
            marginBottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {node.label}
          {node.degree !== undefined && (
            <span className="ml-1 text-gray-400">
              ({node.degree} connections)
            </span>
          )}
        </div>
      )}

      {/* Highlight ring */}
      {isHighlighted && (
        <div
          className="absolute rounded-full"
          style={{
            width: dotSize + 8,
            height: dotSize + 8,
            border: '2px solid #26B87D',
            top: 4,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      )}
    </div>
  );
}
