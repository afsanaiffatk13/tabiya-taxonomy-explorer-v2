import { memo, useCallback, KeyboardEvent, useMemo } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, MapPin } from 'lucide-react';
import type { TreeNode as TreeNodeType, TaxonomyData } from '@/types';
import { getChildrenForNode } from '@/services';

interface TreeNodeProps {
  node: TreeNodeType;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string, type: TreeNodeType['entityType']) => void;
  expandedNodes: Set<string>;
  selectedId: string | null;
  taxonomyData?: TaxonomyData | null;
  domain?: 'occupations' | 'skills';
}

function TreeNodeComponent({
  node,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  expandedNodes,
  selectedId,
  taxonomyData,
  domain = 'occupations',
}: TreeNodeProps) {
  // Use childCount to determine if there are children (lazy loading)
  const hasChildren = node.childCount > 0;
  const indent = node.depth * 16;

  // Load children lazily only when expanded
  const children = useMemo(() => {
    if (!isExpanded || !hasChildren) return [];
    // If children already loaded, use them
    if (node.children.length > 0) return node.children;
    // Otherwise, load children lazily
    if (taxonomyData) {
      return getChildrenForNode(taxonomyData, node.id, domain);
    }
    return [];
  }, [isExpanded, hasChildren, node.children, node.id, taxonomyData, domain]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        onToggle(node.id);
      }
    },
    [hasChildren, node.id, onToggle]
  );

  const handleSelect = useCallback(() => {
    onSelect(node.id, node.entityType);
  }, [node.id, node.entityType, onSelect]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleSelect();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (hasChildren && !isExpanded) {
            onToggle(node.id);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (hasChildren && isExpanded) {
            onToggle(node.id);
          }
          break;
      }
    },
    [handleSelect, hasChildren, isExpanded, node.id, onToggle]
  );

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <div
        className={`group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 transition-colors ${
          isSelected
            ? 'bg-light-green text-oxford-blue'
            : 'hover:bg-soft-green'
        }`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${node.label}${hasChildren ? `, ${node.childCount} children` : ''}`}
      >
        {/* Expand/Collapse Toggle */}
        <button
          type="button"
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors ${
            hasChildren
              ? 'hover:bg-green-3/10 text-green-3'
              : 'invisible'
          }`}
          onClick={handleToggle}
          tabIndex={-1}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          )}
        </button>

        {/* Icon */}
        <span className="flex-shrink-0 text-green-3">
          {node.isGroup ? (
            <Folder className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </span>

        {/* Label */}
        <span className="min-w-0 flex-1 truncate text-sm">
          <span className="mr-1.5 font-mono text-xs text-text-muted">
            {node.code}
          </span>
          {node.label}
        </span>

        {/* Localized Badge */}
        {node.isLocalized && (
          <span className="flex-shrink-0" title="Localized for this region">
            <MapPin className="h-3.5 w-3.5 text-green-2" />
          </span>
        )}

        {/* Child Count */}
        {hasChildren && (
          <span className="flex-shrink-0 text-xs text-text-muted">
            ({node.childCount})
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && children.length > 0 && (
        <ul role="group" className="list-none">
          {children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              isExpanded={expandedNodes.has(child.id)}
              isSelected={selectedId === child.id}
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
    </li>
  );
}

export const TreeNode = memo(TreeNodeComponent);
