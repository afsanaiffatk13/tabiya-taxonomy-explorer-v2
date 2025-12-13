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
  /** Use mock data for development/testing */
  useMockData?: boolean;
}

/**
 * Main NetworkGraph component that orchestrates the visualization
 */
export function NetworkGraph({
  initialNode,
  taxonomyData,
  onClose,
  useMockData = false,
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
  const { graphState, recenter, goBack, canGoBack } = useNetworkData({
    initialNodeId: initialNode.id,
    initialNodeType: initialNode.type,
    initialNodeLabel: initialNode.label,
    taxonomyData,
    useMockData,
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

  // Show message if no connections
  if (graphState.nodes.length <= 1) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <NetworkControls
          history={graphState.history}
          onClose={onClose}
          onHistoryClick={handleHistoryClick}
          canGoBack={canGoBack}
          onGoBack={goBack}
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Controls */}
      <NetworkControls
        history={graphState.history}
        onClose={onClose}
        onHistoryClick={handleHistoryClick}
        canGoBack={canGoBack}
        onGoBack={goBack}
      />

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="relative border border-gray-200 rounded-lg overflow-hidden"
      >
        <NetworkCanvas
          nodes={graphState.nodes}
          edges={graphState.edges}
          centerNodeId={graphState.centerNodeId}
          onNodeClick={handleNodeClick}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>

      {/* Legend */}
      <NetworkLegend />

      {/* Current node info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-text-muted mb-1">
              Currently viewing
            </div>
            <div className="text-lg font-semibold text-oxford-blue">
              {graphState.history[graphState.history.length - 1]?.label}
            </div>
            <div className="text-sm text-text-muted mt-1">
              {graphState.nodes.length} nodes  |{' '}
              {graphState.edges.length} connections
            </div>
          </div>
          <div className="text-right text-sm text-text-muted">
            <div>
              <span className="font-medium text-oxford-blue">
                {graphState.nodes.filter((n) => n.distance === 1).length}
              </span>{' '}
              direct connections
            </div>
            <div>
              <span className="font-medium text-oxford-blue">
                {graphState.nodes.filter((n) => n.distance === 2).length}
              </span>{' '}
              at 2 hops
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
