import { useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, TaxonomyTree, DetailPanel, LoadingState } from '@/components';
import { useAppStore } from '@/store';
import type { TreeNode } from '@/types';

export default function SkillsPage() {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  // Get loading state directly from store
  const isLoading = useAppStore((state) => state.isLoading);
  const taxonomyData = useAppStore((state) => state.taxonomyData);

  // Local state for tree filter
  const [treeFilter, setTreeFilter] = useState('');

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
  const handleSelect = useCallback(
    (id: string, type: TreeNode['entityType']) => {
      if (type === 'skill' || type === 'skillGroup') {
        selectItem(id, type);
      }
    },
    [selectItem]
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

              {/* Detail Panel */}
              <div className="lg:col-span-2">
                <Card className="flex h-[calc(100vh-250px)] flex-col">
                  <CardContent className="flex-1 overflow-y-auto">
                    <DetailPanel
                      item={selectedItem}
                      taxonomyData={taxonomyData}
                      onNavigate={handleNavigate}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
