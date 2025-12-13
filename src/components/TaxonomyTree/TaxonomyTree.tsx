import { memo, useCallback, useRef, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@components/ui';
import { TreeNode } from './TreeNode';
import type { TreeNode as TreeNodeType, TaxonomyData } from '@/types';

interface TaxonomyTreeProps {
  nodes: TreeNodeType[];
  expandedNodes: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string, type: TreeNodeType['entityType']) => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  title?: string;
  taxonomyData?: TaxonomyData | null;
  domain?: 'occupations' | 'skills';
}

function TaxonomyTreeComponent({
  nodes,
  expandedNodes,
  selectedId,
  onToggle,
  onSelect,
  onExpandAll: _onExpandAll,
  onCollapseAll: _onCollapseAll,
  isLoading = false,
  emptyMessage = 'No items to display',
  searchValue = '',
  onSearchChange,
  showSearch = false,
  title,
  taxonomyData,
  domain = 'occupations',
}: TaxonomyTreeProps) {
  const treeRef = useRef<HTMLUListElement>(null);

  // Handle keyboard navigation at tree level
  const handleTreeKeyDown = useCallback((e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'Home') {
      e.preventDefault();
      // Focus first item
      const firstFocusable = treeRef.current?.querySelector('[tabindex="0"]') as HTMLElement;
      firstFocusable?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      // Focus last visible item
      const focusables = treeRef.current?.querySelectorAll('[tabindex="0"]');
      const lastFocusable = focusables?.[focusables.length - 1] as HTMLElement;
      lastFocusable?.focus();
    }
  }, []);

  // Filter nodes based on search (simple text match)
  const filteredNodes = searchValue.trim()
    ? filterTreeNodes(nodes, searchValue.toLowerCase())
    : nodes;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {title && <h2 className="font-semibold text-oxford-blue">{title}</h2>}
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
              <div
                className="h-4 animate-pulse rounded bg-gray-200"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2">
        {title && <h2 className="font-semibold text-oxford-blue">{title}</h2>}

      </div>

      {/* Search */}
      {showSearch && onSearchChange && (
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            type="text"
            placeholder="Filter tree..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Tree */}
      {filteredNodes.length === 0 ? (
        <div className="py-8 text-center text-text-muted">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <ul
          ref={treeRef}
          role="tree"
          aria-label={title || 'Taxonomy tree'}
          className="min-h-0 flex-1 list-none overflow-y-auto"
          onKeyDown={handleTreeKeyDown}
        >
          {filteredNodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              isExpanded={expandedNodes.has(node.id)}
              isSelected={selectedId === node.id}
              onToggle={onToggle}
              onSelect={onSelect}
              expandedNodes={expandedNodes}
              selectedId={selectedId}
              taxonomyData={taxonomyData}
              domain={domain}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// Helper function to filter tree nodes by search query
function filterTreeNodes(nodes: TreeNodeType[], query: string): TreeNodeType[] {
  const result: TreeNodeType[] = [];

  for (const node of nodes) {
    // Check if this node matches
    const matches =
      node.label.toLowerCase().includes(query) ||
      node.code.toLowerCase().includes(query);

    // Recursively filter children
    const filteredChildren = filterTreeNodes(node.children, query);

    if (matches || filteredChildren.length > 0) {
      // Include this node with filtered children
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }
  }

  return result;
}

export const TaxonomyTree = memo(TaxonomyTreeComponent);
