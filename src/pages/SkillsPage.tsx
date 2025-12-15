import { useCallback, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

export default function SkillsPage() {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  // Get loading state directly from store
  const isLoading = useAppStore((state) => state.isLoading);
  const taxonomyData = useAppStore((state) => state.taxonomyData);

  // Local state for tree filter
  const [treeFilter, setTreeFilter] = useState('');

  // Network view state
  const [networkViewNode, setNetworkViewNode] = useState<NetworkViewNode | null>(null);
  const [isNetworkTransitioning, setIsNetworkTransitioning] = useState(false);

  // Brief transition delay to show loading before NetworkGraph mounts
  useEffect(() => {
    if (networkViewNode) {
      setIsNetworkTransitioning(true);
      const timer = setTimeout(() => setIsNetworkTransitioning(false), 50);
      return () => clearTimeout(timer);
    }
  }, [networkViewNode]);

  // Get more state from store
  const expandedNodes = useAppStore((state) => state.expandedNodes);
  const selectedId = useAppStore((state) => state.selectedId);
  const selectedType = useAppStore((state) => state.selectedType);

  // Actions
  const toggleNode = useAppStore((state) => state.toggleNode);
  const selectItem = useAppStore((state) => state.selectItem);
  const expandToItem = useAppStore((state) => state.expandToItem);
  const collapseAll = useAppStore((state) => state.collapseAll);

  // Get tree nodes (full skill tree)
  const treeNodes = useMemo(() => {
    if (!taxonomyData) return [];
    return taxonomyData.skillTree;
  }, [taxonomyData]);

  // Get selected item
  const selectedItem = useMemo(() => {
    if (!selectedId || !selectedType || !taxonomyData) return null;
    if (selectedType === 'skill') {
      return taxonomyData.skills.get(selectedId) ?? null;
    }
    if (selectedType === 'skillGroup') {
      return taxonomyData.skillGroups.get(selectedId) ?? null;
    }
    return null;
  }, [selectedId, selectedType, taxonomyData]);

  // Handle tree node selection - simple store update, no URL
  // When network view is open, clicking skill closes network to show detail panel
  const handleSelect = useCallback(
    (id: string, type: TreeNode['entityType']) => {
      if (type === 'skill' || type === 'skillGroup') {
        selectItem(id, type);
        // Close network view when selecting a skill (not group)
        if (type === 'skill' && networkViewNode) {
          setNetworkViewNode(null);
        }
      }
    },
    [selectItem, networkViewNode]
  );

  // Handle navigation from detail panel
  const handleNavigate = useCallback(
    (id: string, type: string) => {
      const entityType = type as TreeNode['entityType'];
      if (entityType === 'skill' || entityType === 'skillGroup') {
        selectItem(id, entityType);
        expandToItem(id);
      } else if (entityType === 'occupation' || entityType === 'occupationGroup') {
        // Cross-navigate to Occupations page
        selectItem(id, entityType);
        expandToItem(id);
        navigate(`/${lang}/occupations`);
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
      {/* Main Content Area */}
      <div className="flex-1 bg-tabiya-gray">
        <div className="container-app py-8">
          {/* Show loading state if data isn't ready */}
          {!taxonomyData ? (
            <LoadingState
              message="Loading skill data..."
              subMessage="This may take a few moments on first load"
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Tree Panel */}
              <div className="lg:col-span-1">
                <Card className="flex h-[calc(100vh-250px)] flex-col">
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
                      emptyMessage="No skills found"
                      title="Skills Tree"
                      showSearch
                      searchValue={treeFilter}
                      onSearchChange={setTreeFilter}
                      taxonomyData={taxonomyData}
                      domain="skills"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Detail Panel or Network View */}
              <div className="lg:col-span-2">
                {networkViewNode ? (
                  isNetworkTransitioning ? (
                    <Card className="flex h-[calc(100vh-250px)] flex-col">
                      <CardContent className="flex flex-1 items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-green-3" />
                          <p className="text-sm text-text-muted">Loading network view...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <NetworkGraph
                      initialNode={networkViewNode}
                      taxonomyData={taxonomyData}
                      onClose={handleCloseNetworkView}
                    />
                  )
                ) : (
                  <Card className="flex h-[calc(100vh-250px)] flex-col">
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
