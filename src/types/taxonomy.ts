// Core taxonomy data types

export type Language = 'en' | 'es';
export type Localization = 'base' | 'za';

export type OccupationType = 'escooccupation' | 'localoccupation';
export type SkillType = 'skill/competence' | 'knowledge' | 'language' | 'transversal';
export type RelationType = 'essential' | 'optional';

export type OccupationGroupType = 'iscogroup' | 'localgroup';
export type SkillGroupType = 'skillgroup';

// Base entity with common fields
interface BaseEntity {
  id: string;
  code: string;
  preferredLabel: string;
  altLabels: string[];
  description: string;
  isLocalized: boolean;
}

// Occupation entity
export interface Occupation extends BaseEntity {
  entityType: 'occupation';
  occupationType: OccupationType;
  scopeNote: string;
  definition: string;
}

// Occupation group entity
export interface OccupationGroup extends BaseEntity {
  entityType: 'occupationGroup';
  groupType: OccupationGroupType;
}

// Skill entity
export interface Skill extends BaseEntity {
  entityType: 'skill';
  skillType: SkillType;
  scopeNote: string;
  reuseLevel: string;
}

// Skill group entity
export interface SkillGroup extends BaseEntity {
  entityType: 'skillGroup';
  scopeNote: string;
}

// Union types for convenience
export type OccupationEntity = Occupation | OccupationGroup;
export type SkillEntity = Skill | SkillGroup;
export type TaxonomyEntity = OccupationEntity | SkillEntity;

// Hierarchy relationship
export interface HierarchyRelation {
  parentId: string;
  childId: string;
  parentType: string;
  childType: string;
}

// Signalling value label for unseen economy occupations
export type SignallingValueLabel = 'high' | 'medium' | 'low' | '';

// Occupation-to-skill relationship
export interface OccupationSkillRelation {
  occupationId: string;
  skillId: string;
  relationType: RelationType | '';
  signallingValue: number | null;
  signallingValueLabel: SignallingValueLabel;
  occupationType: string;
}

// Tree node for rendering hierarchical data
export interface TreeNode {
  id: string;
  code: string;
  label: string;
  entityType: 'occupation' | 'occupationGroup' | 'skill' | 'skillGroup';
  isGroup: boolean;
  isLocalized: boolean;
  children: TreeNode[];
  childCount: number;
  depth: number;
  parentId: string | null;
}

// Loaded taxonomy data
export interface TaxonomyData {
  // Raw entities
  occupations: Map<string, Occupation>;
  occupationGroups: Map<string, OccupationGroup>;
  skills: Map<string, Skill>;
  skillGroups: Map<string, SkillGroup>;

  // Lookup by code
  occupationsByCode: Map<string, Occupation | OccupationGroup>;
  skillsByCode: Map<string, Skill | SkillGroup>;

  // Hierarchy
  occupationHierarchy: HierarchyRelation[];
  skillHierarchy: HierarchyRelation[];

  // Relations
  occupationToSkillRelations: OccupationSkillRelation[];

  // Pre-built trees (root nodes only - children built on demand)
  occupationTree: TreeNode[];
  skillTree: TreeNode[];

  // Root nodes for different categories
  seenOccupationRoots: TreeNode[];
  unseenOccupationRoots: TreeNode[];

  // Hierarchy maps for lazy child loading
  occChildrenMap: Map<string, string[]>;
  occParentMap: Map<string, string>;
  skillChildrenMap: Map<string, string[]>;
  skillParentMap: Map<string, string>;
}

// Search result item
export interface SearchResult {
  id: string;
  code: string;
  label: string;
  description: string;
  entityType: 'occupation' | 'occupationGroup' | 'skill' | 'skillGroup';
  matchType: 'semantic' | 'keyword';
  score: number;
  highlights?: string[];
}

// Tab types
export type MainTab = 'about' | 'explore' | 'occupations' | 'skills';
export type OccupationSubTab = 'seen' | 'unseen';
export type SkillSubTab = 'competencies' | 'knowledge' | 'transversal' | 'language';
