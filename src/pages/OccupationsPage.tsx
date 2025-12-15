import { useCallback, useMemo, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, TaxonomyTree, DetailPanel, LoadingState } from '@/components';
import { NetworkGraph } from '@/components/NetworkGraph';
import type { NodeType } from '@/components/NetworkGraph';
import { useAppStore } from '@/store';
import type { TreeNode } from '@/types';

// Network view node type
interface NetworkViewNode {
  id: string;
  type: NodeType;
  label: string;
  code: string;
}

const subTabs = [
  { id: 'seen', label: 'Seen Economy', description: 'Formal occupations (ESCO-based)' },
  { id: 'unseen', label: 'Unseen Economy', description: 'Informal and care work (ICATUS-based)' },
] as const;

export default function OccupationsPage() {
  const { lang = 'en', '*': subPath } = useParams<{ lang: string; '*': string }>();
  const navigate = useNavigate();

  // Get loading state directly from store
  const isLoading = useAppStore((state) => state.isLoading);
  const taxonomyData = useAppStore((state) => state.taxonomyData);

  // Local state for tree filter
  const [treeFilter, setTreeFilter] = useState('');

  // Network view state
  const [networkViewNode, setNetworkViewNode] = useState<NetworkViewNode | null>(null);

  // Determine current sub-tab from URL
  const currentSubTab = useMemo(() => {
    if (!subPath) return 'seen';
    return subPath.startsWith('unseen') ? 'unseen' : 'seen';
  }, [subPath]);

  // Get more state from store
  const expandedNodes = useAppStore((state) => state.expandedNodes);
  const selectedId = useAppStore((state) => state.selectedId);
  const selectedType = useAppStore((state) => state.selectedType);

  // Actions
  const toggleNode = useAppStore((state) => state.toggleNode);
  const selectItem = useAppStore((state) => state.selectItem);
  const expandToItem = useAppStore((state) => state.expandToItem);
  const collapseAll = useAppStore((state) => state.collapseAll);

  // Get tree nodes based on current sub-tab
  const treeNodes = useMemo(() => {
    if (!taxonomyData) return [];
    return currentSubTab === 'seen'
      ? taxonomyData.seenOccupationRoots
      : taxonomyData.unseenOccupationRoots;
  }, [taxonomyData, currentSubTab]);

  // Get selected item - supports both occupations and skills for cross-navigation
  const selectedItem = useMemo(() => {
    if (!selectedId || !selectedType || !taxonomyData) return null;
    if (selectedType === 'occupation') {
      return taxonomyData.occupations.get(selectedId) ?? null;
    }
    if (selectedType === 'occupationGroup') {
      return taxonomyData.occupationGroups.get(selectedId) ?? null;
    }
    return null;
  }, [selectedId, selectedType, taxonomyData]);

  // Handle tree node selection - simple store update, no URL
  const handleSelect = useCallback(
    (id: string, type: TreeNode['entityType']) => {
      if (type === 'occupation' || type === 'occupationGroup') {
        selectItem(id, type);
      }
    },
    [selectItem]
  );

  // Handle navigation from detail panel
  const handleNavigate = useCallback(
    (id: string, type: string) => {
      const entityType = type as TreeNode['entityType'];
      if (entityType === 'occupation' || entityType === 'occupationGroup') {
        selectItem(id, entityType);
        expandToItem(id);
      } else if (entityType === 'skill' || entityType === 'skillGroup') {
        // Cross-navigate to Skills page
        selectItem(id, entityType);
        expandToItem(id);
        navigate(`/${lang}/skills`);
      }
    },
    [selectItem, expandToItem, navigate, lang]
  );

  // Handle showing network view
  const handleShowNetwork = useCallback(
    (id: string, type: 'occupation' | 'skill', label: string, code: string) => {
      setNetworkViewNode({ id, type, label, code });
    },
    []
  );

  // Close network view
  const handleCloseNetworkView = useCallback(() => {
    setNetworkViewNode(null);
  }, []);

  // Expand all nodes (just top level for performance)
  const handleExpandAll = useCallback(() => {
    if (!treeNodes.length) return;
    const newExpanded = new Set(expandedNodes);
    treeNodes.forEach((node) => newExpanded.add(node.id));
    useAppStore.getState().setExpandedNodes(newExpanded);
  }, [treeNodes, expandedNodes]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      {/* Sub-tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container-app">
          <div className="flex gap-1" role="tablist">
            {subTabs.map(({ id, label }) => (
              <NavLink
                key={id}
                to={`/${lang}/occupations/${id}`}
                role="tab"
                className={({ isActive }) => {
                  const active = id === 'seen'
                    ? (isActive || currentSubTab === 'seen')
                    : (isActive || currentSubTab === 'unseen');
                  return `px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'border-b-2 border-green-3 text-green-3'
                      : 'text-text-muted hover:text-oxford-blue'
                  }`;
                }}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-tabiya-gray">
        <div className="container-app py-8">
          {/* Show loading state if data isn't ready */}
          {!taxonomyData ? (
            <LoadingState
              message="Loading occupation data..."
              subMessage="This may take a few moments on first load"
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Tree Panel */}
              <div className="lg:col-span-1">
                <Card className="flex h-[calc(100vh-300px)] flex-col">
                  <CardContent className="flex min-h-0 flex-1 flex-col">
                    <TaxonomyTree
                      nodes={treeNodes}
                      expandedNodes={expandedNodes}
                      selectedId={selectedId}
                      onToggle={toggleNode}
                      onSelect={handleSelect}
                      onExpandAll={handleExpandAll}
                      onCollapseAll={collapseAll}
                      isLoading={isLoading}
                      emptyMessage={
                        currentSubTab === 'unseen'
                          ? 'No unseen economy occupations found'
                          : 'No occupations found'
                      }
                      title="Occupation Tree"
                      showSearch
                      searchValue={treeFilter}
                      onSearchChange={setTreeFilter}
                      taxonomyData={taxonomyData}
                      domain="occupations"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Detail Panel or Network View */}
              <div className="lg:col-span-2">
                {networkViewNode ? (
                  <NetworkGraph
                    initialNode={networkViewNode}
                    taxonomyData={taxonomyData}
                    onClose={handleCloseNetworkView}
                  />
                ) : (
                  <Card className="flex h-[calc(100vh-300px)] flex-col">
                    <CardContent className="flex-1 overflow-y-auto">
                      <DetailPanel
                        item={selectedItem}
                        taxonomyData={taxonomyData}
                        onNavigate={handleNavigate}
                        onShowNetwork={handleShowNetwork}
                        isLoading={isLoading}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
