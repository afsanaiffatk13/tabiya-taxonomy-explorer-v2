/**
 * Supabase-based Data Loader
 *
 * Loads taxonomy data from Supabase PostgreSQL instead of CSV files.
 * This provides faster initial load times by avoiding 37MB CSV downloads.
 */

import { supabase } from './supabaseClient';
import type {
  Language,
  Localization,
  Occupation,
  OccupationGroup,
  Skill,
  SkillGroup,
  HierarchyRelation,
  OccupationSkillRelation,
  TaxonomyData,
  TreeNode,
  OccupationType,
  SkillType,
  RelationType,
  OccupationGroupType,
} from '@/types';

// Transform database row to Occupation entity
function transformOccupation(row: {
  id: string;
  code: string;
  preferred_label: string;
  alt_labels: string[] | null;
  description: string | null;
  occupation_type: string;
  definition: string | null;
  is_localized: boolean;
}): Occupation {
  return {
    id: row.id,
    code: row.code,
    preferredLabel: row.preferred_label,
    altLabels: row.alt_labels || [],
    description: row.description || '',
    occupationType: row.occupation_type as OccupationType,
    scopeNote: '',
    definition: row.definition || '',
    isLocalized: row.is_localized,
    entityType: 'occupation',
  };
}

// Transform database row to OccupationGroup entity
function transformOccupationGroup(row: {
  id: string;
  code: string;
  preferred_label: string;
  alt_labels: string[] | null;
  description: string | null;
  group_type: string | null;
}): OccupationGroup {
  return {
    id: row.id,
    code: row.code,
    preferredLabel: row.preferred_label,
    altLabels: row.alt_labels || [],
    description: row.description || '',
    groupType: (row.group_type || 'iscogroup') as OccupationGroupType,
    isLocalized: false,
    entityType: 'occupationGroup',
  };
}

// Transform database row to Skill entity
function transformSkill(row: {
  id: string;
  code: string | null;
  preferred_label: string;
  alt_labels: string[] | null;
  description: string | null;
  skill_type: string | null;
  reuse_level: string | null;
  is_localized: boolean;
}): Skill {
  return {
    id: row.id,
    code: row.code || '',
    preferredLabel: row.preferred_label,
    altLabels: row.alt_labels || [],
    description: row.description || '',
    skillType: (row.skill_type || 'skill/competence') as SkillType,
    scopeNote: '',
    reuseLevel: row.reuse_level || '',
    isLocalized: row.is_localized,
    entityType: 'skill',
  };
}

// Transform database row to SkillGroup entity
function transformSkillGroup(row: {
  id: string;
  code: string;
  preferred_label: string;
  alt_labels: string[] | null;
  description: string | null;
}): SkillGroup {
  return {
    id: row.id,
    code: row.code,
    preferredLabel: row.preferred_label,
    altLabels: row.alt_labels || [],
    description: row.description || '',
    scopeNote: '',
    isLocalized: false,
    entityType: 'skillGroup',
  };
}

// Transform hierarchy row
function transformHierarchy(row: {
  parent_id: string;
  child_id: string;
  parent_type: string;
  child_type: string;
}): HierarchyRelation {
  return {
    parentId: row.parent_id,
    childId: row.child_id,
    parentType: row.parent_type,
    childType: row.child_type,
  };
}

// Transform relation row
function transformRelation(row: {
  occupation_id: string;
  skill_id: string;
  relation_type: string;
  signalling_value: number | null;
  signalling_value_label: string | null;
  occupation_type: string | null;
}): OccupationSkillRelation {
  return {
    occupationId: row.occupation_id,
    skillId: row.skill_id,
    relationType: (row.relation_type || '') as RelationType | '',
    signallingValue: row.signalling_value,
    signallingValueLabel: (row.signalling_value_label?.toLowerCase() || '') as 'high' | 'medium' | 'low' | '',
    occupationType: row.occupation_type || '',
  };
}

// Build LAZY tree - only builds root nodes, children are built on-demand
function buildLazyTree(
  entities: Map<string, { id: string; code: string; preferredLabel: string; isLocalized: boolean; entityType: string }>,
  childrenMap: Map<string, string[]>,
  parentMap: Map<string, string>,
  entityTypeForItem: 'occupation' | 'skill',
  entityTypeForGroup: 'occupationGroup' | 'skillGroup'
): TreeNode[] {
  // Find root nodes (nodes with no parent)
  const rootIds: string[] = [];
  for (const entity of entities.values()) {
    if (!parentMap.has(entity.id)) {
      rootIds.push(entity.id);
    }
  }

  // Build ONLY root-level tree nodes (not recursive!)
  const trees: TreeNode[] = [];
  for (const rootId of rootIds) {
    const entity = entities.get(rootId);
    if (!entity) continue;

    const childIds = childrenMap.get(rootId) || [];
    const isGroup =
      entity.entityType === entityTypeForGroup ||
      entity.entityType === 'occupationGroup' ||
      entity.entityType === 'skillGroup';

    trees.push({
      id: entity.id,
      code: entity.code,
      label: entity.preferredLabel,
      entityType: isGroup ? entityTypeForGroup : entityTypeForItem,
      isGroup,
      isLocalized: entity.isLocalized,
      children: [], // Children built on-demand!
      childCount: childIds.length,
      depth: 0,
      parentId: null,
    });
  }

  // Sort root nodes by code
  trees.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  return trees;
}

// Check if an occupation/group code is unseen economy (ICATUS-based, starting with 'I')
// Not exported - use the one from dataLoader.ts
function isUnseenEconomy(code: string): boolean {
  return code.startsWith('I');
}

// Separate seen and unseen occupation roots
function separateOccupationRoots(
  tree: TreeNode[],
  occupationGroups: Map<string, OccupationGroup>
): { seen: TreeNode[]; unseen: TreeNode[] } {
  const seen: TreeNode[] = [];
  const unseen: TreeNode[] = [];

  for (const node of tree) {
    const group = occupationGroups.get(node.id);
    // Unseen economy: codes starting with 'I' (ICATUS-based) or groups with localgroup type
    if (group?.groupType === 'localgroup' || isUnseenEconomy(node.code)) {
      unseen.push(node);
    } else {
      seen.push(node);
    }
  }

  return { seen, unseen };
}

/**
 * Fetch all data from a Supabase table with pagination
 * Handles the 1000 row limit by fetching in batches
 */
async function fetchAllFromTable<T>(
  tableName: string,
  selectColumns: string = '*'
): Promise<T[]> {
  const pageSize = 1000;
  let allData: T[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectColumns)
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch from ${tableName}: ${error.message}`);
    }

    if (data && data.length > 0) {
      allData = allData.concat(data as T[]);
      offset += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  return allData;
}

/**
 * Main data loading function - loads from Supabase
 */
export async function loadTaxonomyDataFromSupabase(
  _lang: Language,
  _loc: Localization
): Promise<TaxonomyData> {
  const totalStart = performance.now();
  console.log('[loadTaxonomyDataFromSupabase] Loading from Supabase...');

  // Load all data in parallel
  const fetchStart = performance.now();
  const [
    occupationRows,
    occupationGroupRows,
    skillRows,
    skillGroupRows,
    occupationHierarchyRows,
    skillHierarchyRows,
    relationRows,
  ] = await Promise.all([
    fetchAllFromTable<{
      id: string;
      code: string;
      preferred_label: string;
      alt_labels: string[] | null;
      description: string | null;
      occupation_type: string;
      definition: string | null;
      is_localized: boolean;
    }>('occupations'),
    fetchAllFromTable<{
      id: string;
      code: string;
      preferred_label: string;
      alt_labels: string[] | null;
      description: string | null;
      group_type: string | null;
    }>('occupation_groups'),
    fetchAllFromTable<{
      id: string;
      code: string | null;
      preferred_label: string;
      alt_labels: string[] | null;
      description: string | null;
      skill_type: string | null;
      reuse_level: string | null;
      is_localized: boolean;
    }>('skills'),
    fetchAllFromTable<{
      id: string;
      code: string;
      preferred_label: string;
      alt_labels: string[] | null;
      description: string | null;
    }>('skill_groups'),
    fetchAllFromTable<{
      parent_id: string;
      child_id: string;
      parent_type: string;
      child_type: string;
    }>('occupation_hierarchy'),
    fetchAllFromTable<{
      parent_id: string;
      child_id: string;
      parent_type: string;
      child_type: string;
    }>('skill_hierarchy'),
    fetchAllFromTable<{
      occupation_id: string;
      skill_id: string;
      relation_type: string;
      signalling_value: number | null;
      signalling_value_label: string | null;
      occupation_type: string | null;
    }>('occupation_skill_relations'),
  ]);

  console.log(`[loadTaxonomyDataFromSupabase] All fetches complete in ${(performance.now() - fetchStart).toFixed(0)}ms`);
  console.log(`[loadTaxonomyDataFromSupabase] Rows: occupations=${occupationRows.length}, skills=${skillRows.length}, relations=${relationRows.length}`);

  // Transform to entity maps
  const transformStart = performance.now();

  const occupations = new Map<string, Occupation>();
  for (const row of occupationRows) {
    const occupation = transformOccupation(row);
    occupations.set(occupation.id, occupation);
  }

  const occupationGroups = new Map<string, OccupationGroup>();
  for (const row of occupationGroupRows) {
    const group = transformOccupationGroup(row);
    occupationGroups.set(group.id, group);
  }

  const skills = new Map<string, Skill>();
  for (const row of skillRows) {
    const skill = transformSkill(row);
    skills.set(skill.id, skill);
  }

  const skillGroups = new Map<string, SkillGroup>();
  for (const row of skillGroupRows) {
    const group = transformSkillGroup(row);
    skillGroups.set(group.id, group);
  }

  console.log(`[loadTaxonomyDataFromSupabase] Entity maps built in ${(performance.now() - transformStart).toFixed(0)}ms`);

  // Build hierarchy maps
  const hierarchyStart = performance.now();

  // Occupation hierarchy
  const occChildrenMap = new Map<string, string[]>();
  const occParentMap = new Map<string, string>();
  for (const row of occupationHierarchyRows) {
    const rel = transformHierarchy(row);
    if (!occChildrenMap.has(rel.parentId)) {
      occChildrenMap.set(rel.parentId, []);
    }
    occChildrenMap.get(rel.parentId)!.push(rel.childId);
    occParentMap.set(rel.childId, rel.parentId);
  }

  // Skill hierarchy
  const skillChildrenMap = new Map<string, string[]>();
  const skillParentMap = new Map<string, string>();
  for (const row of skillHierarchyRows) {
    const rel = transformHierarchy(row);
    if (!skillChildrenMap.has(rel.parentId)) {
      skillChildrenMap.set(rel.parentId, []);
    }
    skillChildrenMap.get(rel.parentId)!.push(rel.childId);
    skillParentMap.set(rel.childId, rel.parentId);
  }

  console.log(`[loadTaxonomyDataFromSupabase] Hierarchy maps built in ${(performance.now() - hierarchyStart).toFixed(0)}ms`);

  // Build code lookup maps
  const occupationsByCode = new Map<string, Occupation | OccupationGroup>();
  for (const occ of occupations.values()) {
    occupationsByCode.set(occ.code, occ);
  }
  for (const group of occupationGroups.values()) {
    occupationsByCode.set(group.code, group);
  }

  const skillsByCode = new Map<string, Skill | SkillGroup>();
  for (const skill of skills.values()) {
    if (skill.code) {
      skillsByCode.set(skill.code, skill);
    }
  }
  for (const group of skillGroups.values()) {
    skillsByCode.set(group.code, group);
  }

  // Transform relations
  const occupationToSkillRelations = relationRows.map(transformRelation);

  // Store hierarchy relations for breadcrumb building
  const occupationHierarchy = occupationHierarchyRows.map(transformHierarchy);
  const skillHierarchy = skillHierarchyRows.map(transformHierarchy);

  // Build LAZY trees
  const treeStart = performance.now();

  // Combined entity maps for tree building
  const allOccupationEntities = new Map<string, Occupation | OccupationGroup>();
  for (const [id, entity] of occupations) {
    allOccupationEntities.set(id, entity);
  }
  for (const [id, entity] of occupationGroups) {
    allOccupationEntities.set(id, entity);
  }

  const allSkillEntities = new Map<string, Skill | SkillGroup>();
  for (const [id, entity] of skills) {
    allSkillEntities.set(id, entity);
  }
  for (const [id, entity] of skillGroups) {
    allSkillEntities.set(id, entity);
  }

  const occupationTree = buildLazyTree(
    allOccupationEntities,
    occChildrenMap,
    occParentMap,
    'occupation',
    'occupationGroup'
  );

  const skillTree = buildLazyTree(
    allSkillEntities,
    skillChildrenMap,
    skillParentMap,
    'skill',
    'skillGroup'
  );

  console.log(`[loadTaxonomyDataFromSupabase] Lazy trees built in ${(performance.now() - treeStart).toFixed(0)}ms`);

  // Separate seen/unseen occupation roots
  const { seen: seenOccupationRoots, unseen: unseenOccupationRoots } =
    separateOccupationRoots(occupationTree, occupationGroups);

  const totalTime = performance.now() - totalStart;
  console.log(`[loadTaxonomyDataFromSupabase] TOTAL: ${totalTime.toFixed(0)}ms`);
  console.log(`[loadTaxonomyDataFromSupabase] Loaded: ${occupations.size} occupations, ${skills.size} skills, ${occupationToSkillRelations.length} relations`);

  return {
    occupations,
    occupationGroups,
    skills,
    skillGroups,
    occupationsByCode,
    skillsByCode,
    occupationHierarchy,
    skillHierarchy,
    occupationToSkillRelations,
    occupationTree,
    skillTree,
    seenOccupationRoots,
    unseenOccupationRoots,
    occChildrenMap,
    occParentMap,
    skillChildrenMap,
    skillParentMap,
  };
}
