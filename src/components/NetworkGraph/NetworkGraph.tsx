import { useRef, useEffect, useState, useCallback } from 'react';
import type { TaxonomyData } from '@/types/taxonomy';
import type { NodeType } from './networkTypes';
import { useNetworkData } from './useNetworkData';
import { NetworkCanvas } from './NetworkCanvas';
import { NetworkControls } from './NetworkControls';
import { NetworkLegend } from './NetworkLegend';

export interface NetworkGraphProps {
  initialNode: {
    id: string;
    type: NodeType;
    label: string;
    code: string;
  };
  taxonomyData?: TaxonomyData | null;
  onClose: () => void;
  hideBackButton?: boolean;
}

/**
 * Main NetworkGraph component that orchestrates the visualization
 */
export function NetworkGraph({
  initialNode,
  taxonomyData,
  onClose,
  hideBackButton = false,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Set up responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Responsive height
        const isMobile = window.innerWidth < 768;
        const maxHeight = isMobile
          ? Math.min(window.innerHeight - 250, 450)
          : Math.min(window.innerHeight - 300, 600);
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(maxHeight, 300),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize network data
  const { graphState, recenter, goBack, canGoBack, isLoading } = useNetworkData({
    initialNodeId: initialNode.id,
    initialNodeType: initialNode.type,
    initialNodeLabel: initialNode.label,
    taxonomyData,
  });

  // Handle node click (recenter)
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      recenter(nodeId);
    },
    [recenter]
  );

  // Handle history navigation
  const handleHistoryClick = useCallback(
    (index: number) => {
      // Go back to a specific point in history
      // We need to rebuild the graph at that point
      const targetEntry = graphState.history[index];
      if (targetEntry) {
        // For now, just go back multiple times
        // A more efficient approach would store full states
        const stepsBack = graphState.history.length - 1 - index;
        for (let i = 0; i < stepsBack; i++) {
          goBack();
        }
      }
    },
    [graphState.history, goBack]
  );

  // Show message if no connections (only after loading is done)
  if (!isLoading && graphState.nodes.length <= 1) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <NetworkControls
          history={graphState.history}
          onClose={onClose}
          onHistoryClick={handleHistoryClick}
          canGoBack={canGoBack}
          onGoBack={goBack}
          hideBackButton={hideBackButton}
        />
        <div className="text-center py-12">
          <div className="text-lg font-medium text-oxford-blue mb-2">
            No connections found
          </div>
          <p className="text-text-muted">
            This {initialNode.type} doesn't have any related{' '}
            {initialNode.type === 'occupation' ? 'skills' : 'occupations'} in the
            database.
          </p>
        </div>
      </div>
    );
  }

  // Get center node for centrality display
  const centerNode = graphState.nodes.find(n => n.distance === 0);
  const centralityScore = centerNode?.centrality;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
      {/* Controls */}
      <NetworkControls
        history={graphState.history}
        onClose={onClose}
        onHistoryClick={handleHistoryClick}
        canGoBack={canGoBack}
        onGoBack={goBack}
        hideBackButton={hideBackButton}
      />

      {/* Current node info - ABOVE graph */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="text-xs uppercase tracking-wide text-text-muted mb-1">
          Currently viewing
        </div>
        <div className="text-lg font-semibold text-oxford-blue">
          {graphState.history[graphState.history.length - 1]?.label}
        </div>
        <div className="text-sm text-text-muted mt-1">
          {graphState.nodes.length} nodes | {graphState.edges.length} connections
          {centralityScore !== undefined && (
            <> | Centrality: {(centralityScore * 100).toFixed(0)}%</>
          )}
        </div>
        {/* Truncation notice - left aligned, orange color */}
        {graphState.isTruncated && (
          <div className="text-xs text-orange-600 mt-1">
            Showing top connections. For complete list, explore the tree.
          </div>
        )}
        {/* Legend - moved above graph */}
        <NetworkLegend />
      </div>

      {/* Canvas container - full width */}
      <div
        ref={containerRef}
        className="relative border border-gray-200 rounded-lg overflow-hidden w-full"
      >
        <NetworkCanvas
          nodes={graphState.nodes}
          edges={graphState.edges}
          centerNodeId={graphState.centerNodeId}
          onNodeClick={handleNodeClick}
          width={dimensions.width}
          height={dimensions.height}
          isDataLoading={isLoading}
        />
      </div>
    </div>
  );
}
