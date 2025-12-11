import { memo, useMemo, useState } from 'react';
import {
  FileText,
  Folder,
  Tag as TagIcon,
  BookOpen,
  Briefcase,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Tag } from '@components/ui';
import { Breadcrumb } from './Breadcrumb';
import type {
  Occupation,
  OccupationGroup,
  Skill,
  SkillGroup,
  TaxonomyData,
} from '@/types';
import {
  getBreadcrumbPath,
  getRelatedSkills,
  getRelatedOccupations,
  getOccupationGroupChildren,
  getSkillGroupChildren,
} from '@/services';

type Entity = Occupation | OccupationGroup | Skill | SkillGroup;

interface DetailPanelProps {
  item: Entity | null;
  taxonomyData: TaxonomyData | null;
  onNavigate: (id: string, type: string) => void;
  isLoading?: boolean;
}

function DetailPanelComponent({
  item,
  taxonomyData,
  onNavigate,
  isLoading = false,
}: DetailPanelProps) {
  // Get breadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!item || !taxonomyData) return [];
    return getBreadcrumbPath(
      taxonomyData,
      item.id,
      item.entityType as 'occupation' | 'occupationGroup' | 'skill' | 'skillGroup'
    );
  }, [item, taxonomyData]);

  // Get related items
  const relatedSkills = useMemo(() => {
    if (!item || !taxonomyData || item.entityType !== 'occupation') return [];
    return getRelatedSkills(taxonomyData, item.id);
  }, [item, taxonomyData]);

  const relatedOccupations = useMemo(() => {
    if (!item || !taxonomyData || item.entityType !== 'skill') return [];
    return getRelatedOccupations(taxonomyData, item.id);
  }, [item, taxonomyData]);

  // Get children for groups
  const occupationGroupChildren = useMemo(() => {
    if (!item || !taxonomyData || item.entityType !== 'occupationGroup') {
      return { subGroups: [], occupations: [] };
    }
    return getOccupationGroupChildren(taxonomyData, item.id);
  }, [item, taxonomyData]);

  const skillGroupChildren = useMemo(() => {
    if (!item || !taxonomyData || item.entityType !== 'skillGroup') {
      return { subGroups: [], skills: [] };
    }
    return getSkillGroupChildren(taxonomyData, item.id);
  }, [item, taxonomyData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!item) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-soft-green p-4">
          <FileText className="h-8 w-8 text-green-3" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-oxford-blue">
          Select an item
        </h3>
        <p className="max-w-sm text-text-muted">
          Click on an item in the tree to view its details, including description,
          alternative labels, and related items.
        </p>
      </div>
    );
  }

  // Determine item type info
  const isOccupation = item.entityType === 'occupation';
  const isSkill = item.entityType === 'skill';
  const isGroup = item.entityType === 'occupationGroup' || item.entityType === 'skillGroup';

  // Get type-specific fields
  const occupationType = isOccupation ? (item as Occupation).occupationType : null;
  const skillType = isSkill ? (item as Skill).skillType : null;
  const scopeNote =
    isOccupation || isSkill
      ? (item as Occupation | Skill).scopeNote
      : item.entityType === 'skillGroup'
        ? (item as SkillGroup).scopeNote
        : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb path={breadcrumbPath} onNavigate={onNavigate} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`rounded-lg p-2 ${isGroup ? 'bg-soft-green' : 'bg-light-green'}`}>
            {isGroup ? (
              <Folder className="h-6 w-6 text-green-3" />
            ) : isOccupation ? (
              <Briefcase className="h-6 w-6 text-green-3" />
            ) : (
              <BookOpen className="h-6 w-6 text-green-3" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            {/* Code */}
            <p className="font-mono text-sm text-text-muted">{item.code}</p>

            {/* Label */}
            <h1 className="text-xl font-bold text-oxford-blue">
              {item.preferredLabel}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {occupationType && (
                <Tag variant={occupationType === 'escooccupation' ? 'seen' : 'unseen'}>
                  {occupationType === 'escooccupation' ? 'Seen Economy' : 'Unseen Economy'}
                </Tag>
              )}
              {skillType && (
                <Tag variant="skill">
                  {formatSkillType(skillType)}
                </Tag>
              )}
              {isGroup && (
                <Tag variant="default">Group</Tag>
              )}
              {item.isLocalized && (
                <Tag variant="localized">
                  <MapPin className="mr-1 h-3 w-3" />
                  Localized
                </Tag>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Description
          </h2>
          <p className="whitespace-pre-wrap text-oxford-blue">{item.description}</p>
        </section>
      )}

      {/* Scope Note */}
      {scopeNote && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Scope Note
          </h2>
          <p className="whitespace-pre-wrap text-oxford-blue">{scopeNote}</p>
        </section>
      )}

      {/* Alternative Labels */}
      {item.altLabels.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Alternative Names
          </h2>
          <div className="flex flex-wrap gap-2">
            {item.altLabels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-tabiya-gray px-3 py-1 text-sm text-oxford-blue"
              >
                <TagIcon className="h-3 w-3 text-text-muted" />
                {label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Related Skills (for occupations) */}
      {relatedSkills.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Related Skills ({relatedSkills.length})
          </h2>
          {/* Check if this is unseen economy (has signalling values) */}
          {relatedSkills.some(r => r.signallingValueLabel) ? (
            // Unseen economy: group by signalling value
            <div className="space-y-4">
              {/* High signalling */}
              {relatedSkills.filter(r => r.signallingValueLabel === 'high').length > 0 && (
                <div className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent pl-4">
                  <p className="mb-2 text-xs font-semibold text-blue-600">High Signalling Value</p>
                  <ExpandableList
                    items={relatedSkills
                      .filter((r) => r.signallingValueLabel === 'high')
                      .map(({ skill }) => ({ id: skill.id, label: skill.preferredLabel }))}
                    type="skill"
                    onNavigate={onNavigate}
                    initialCount={15}
                  />
                </div>
              )}

              {/* Medium signalling */}
              {relatedSkills.filter(r => r.signallingValueLabel === 'medium').length > 0 && (
                <div className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-transparent pl-4">
                  <p className="mb-2 text-xs font-semibold text-green-600">Medium Signalling Value</p>
                  <ExpandableList
                    items={relatedSkills
                      .filter((r) => r.signallingValueLabel === 'medium')
                      .map(({ skill }) => ({ id: skill.id, label: skill.preferredLabel }))}
                    type="skill"
                    onNavigate={onNavigate}
                    initialCount={15}
                  />
                </div>
              )}

              {/* Low signalling */}
              {relatedSkills.filter(r => r.signallingValueLabel === 'low').length > 0 && (
                <div className="border-l-4 border-gray-400 bg-gradient-to-r from-gray-50 to-transparent pl-4">
                  <p className="mb-2 text-xs font-semibold text-gray-600">Low Signalling Value</p>
                  <ExpandableList
                    items={relatedSkills
                      .filter((r) => r.signallingValueLabel === 'low')
                      .map(({ skill }) => ({ id: skill.id, label: skill.preferredLabel }))}
                    type="skill"
                    onNavigate={onNavigate}
                    initialCount={10}
                  />
                </div>
              )}
            </div>
          ) : (
            // Seen economy: group by relation type
            <div className="space-y-4">
              {/* Essential skills first */}
              {relatedSkills.filter(r => r.relationType === 'essential').length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-green-3">Essential</p>
                  <ExpandableList
                    items={relatedSkills
                      .filter((r) => r.relationType === 'essential')
                      .map(({ skill }) => ({ id: skill.id, label: skill.preferredLabel }))}
                    type="skill"
                    onNavigate={onNavigate}
                    initialCount={15}
                  />
                </div>
              )}

              {/* Optional skills */}
              {relatedSkills.filter(r => r.relationType === 'optional').length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-text-muted">Optional</p>
                  <ExpandableList
                    items={relatedSkills
                      .filter((r) => r.relationType === 'optional')
                      .map(({ skill }) => ({ id: skill.id, label: skill.preferredLabel }))}
                    type="skill"
                    onNavigate={onNavigate}
                    initialCount={10}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Related Occupations (for skills) */}
      {relatedOccupations.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Related Occupations ({relatedOccupations.length})
          </h2>
          <ExpandableList
            items={relatedOccupations.map(({ occupation }) => ({
              id: occupation.id,
              label: occupation.preferredLabel,
            }))}
            type="occupation"
            onNavigate={onNavigate}
            initialCount={20}
          />
        </section>
      )}

      {/* Sub-groups for occupation groups */}
      {item.entityType === 'occupationGroup' && occupationGroupChildren.subGroups.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Sub-groups ({occupationGroupChildren.subGroups.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {occupationGroupChildren.subGroups.map((group) => (
              <GroupCard
                key={group.id}
                id={group.id}
                code={group.code}
                label={group.preferredLabel}
                description={group.description}
                type="occupationGroup"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* Child occupations for occupation groups */}
      {item.entityType === 'occupationGroup' && occupationGroupChildren.occupations.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Occupations ({occupationGroupChildren.occupations.length})
          </h2>
          <ExpandableList
            items={occupationGroupChildren.occupations.map((occ) => ({
              id: occ.id,
              label: occ.preferredLabel,
            }))}
            type="occupation"
            onNavigate={onNavigate}
            initialCount={30}
          />
        </section>
      )}

      {/* Sub-groups for skill groups */}
      {item.entityType === 'skillGroup' && skillGroupChildren.subGroups.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Sub-groups ({skillGroupChildren.subGroups.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {skillGroupChildren.subGroups.map((group) => (
              <GroupCard
                key={group.id}
                id={group.id}
                code={group.code}
                label={group.preferredLabel}
                description={group.description}
                type="skillGroup"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* Child skills for skill groups */}
      {item.entityType === 'skillGroup' && skillGroupChildren.skills.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Skills ({skillGroupChildren.skills.length})
          </h2>
          <ExpandableList
            items={skillGroupChildren.skills.map((skill) => ({
              id: skill.id,
              label: skill.preferredLabel,
            }))}
            type="skill"
            onNavigate={onNavigate}
            initialCount={30}
          />
        </section>
      )}
    </div>
  );
}

// Helper component for related item links
interface RelatedItemLinkProps {
  id: string;
  label: string;
  type: 'occupation' | 'skill';
  onNavigate: (id: string, type: string) => void;
}

function RelatedItemLink({ id, label, type, onNavigate }: RelatedItemLinkProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onNavigate(id, type)}
        className="group flex items-center gap-1 text-left text-sm text-green-3 transition-colors hover:text-oxford-blue"
      >
        <span className="group-hover:underline">{label}</span>
        <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </li>
  );
}

// Expandable list component
interface ExpandableListProps {
  items: { id: string; label: string }[];
  type: 'occupation' | 'skill';
  onNavigate: (id: string, type: string) => void;
  initialCount?: number;
}

function ExpandableList({ items, type, onNavigate, initialCount = 15 }: ExpandableListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedItems = isExpanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  return (
    <>
      <ul className="space-y-1">
        {displayedItems.map((item) => (
          <RelatedItemLink
            key={item.id}
            id={item.id}
            label={item.label}
            type={type}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-green-3 transition-colors hover:text-oxford-blue"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronRight className="h-3 w-3" />
              Show {items.length - initialCount} more
            </>
          )}
        </button>
      )}
    </>
  );
}

// Helper component for group cards
interface GroupCardProps {
  id: string;
  code: string;
  label: string;
  description: string;
  type: 'occupationGroup' | 'skillGroup';
  onNavigate: (id: string, type: string) => void;
}

function GroupCard({ id, code, label, description, type, onNavigate }: GroupCardProps) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(id, type)}
      className="group flex w-full flex-col gap-1 rounded-lg border border-gray-200 bg-tabiya-gray p-4 text-left transition-all hover:-translate-y-0.5 hover:border-green-3 hover:bg-soft-green"
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-green-3">{code}</span>
        <ChevronRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <span className="font-medium text-oxford-blue">{label}</span>
      {description && (
        <span className="line-clamp-2 text-sm text-text-muted">
          {description.substring(0, 120)}
          {description.length > 120 ? '...' : ''}
        </span>
      )}
    </button>
  );
}

// Format skill type for display
function formatSkillType(skillType: string): string {
  const types: Record<string, string> = {
    'skill/competence': 'Skill/Competence',
    'knowledge': 'Knowledge',
    'language': 'Language',
    'transversal': 'Transversal',
  };
  return types[skillType] || skillType;
}

export const DetailPanel = memo(DetailPanelComponent);
