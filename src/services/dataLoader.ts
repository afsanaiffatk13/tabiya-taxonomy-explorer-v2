import Papa from 'papaparse';
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

// CSV row types (raw data from files)
interface OccupationRow {
  ID: string;
  CODE: string;
  PREFERREDLABEL: string;
  ALTLABELS: string;
  DESCRIPTION: string;
  OCCUPATIONTYPE: string;
  SCOPENOTE: string;
  DEFINITION: string;
  ISLOCALIZED: string;
}

interface OccupationGroupRow {
  ID: string;
  CODE: string;
  PREFERREDLABEL: string;
  ALTLABELS: string;
  DESCRIPTION: string;
  GROUPTYPE: string;
}

interface SkillRow {
  ID: string;
  CODE?: string;
  PREFERREDLABEL: string;
  ALTLABELS: string;
  DESCRIPTION: string;
  SKILLTYPE: string;
  SCOPENOTE: string;
  REUSELEVEL: string;
  ISLOCALIZED: string;
}

interface SkillGroupRow {
  ID: string;
  CODE: string;
  PREFERREDLABEL: string;
  ALTLABELS: string;
  DESCRIPTION: string;
  SCOPENOTE: string;
}

interface HierarchyRow {
  PARENTID: string;
  CHILDID: string;
  PARENTOBJECTTYPE: string;
  CHILDOBJECTTYPE: string;
}

interface RelationRow {
  OCCUPATIONID: string;
  SKILLID: string;
  RELATIONTYPE: string;
  SIGNALLINGVALUE: string;
  SIGNALLINGVALUELABEL: string;
  OCCUPATIONTYPE: string;
}

// Parse helper for alt labels (newline or pipe separated)
function parseAltLabels(altLabels: string): string[] {
  if (!altLabels) return [];
  return altLabels
    .split(/[\n|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Fetch and parse a CSV file - OPTIMIZED for speed
async function fetchCSV<T>(url: string): Promise<T[]> {
  const startTime = performance.now();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const text = await response.text();
  const fetchTime = performance.now() - startTime;

  const parseStart = performance.now();
  const result = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    // Don't use dynamicTyping - keep everything as strings for speed
    transformHeader: (header) => header.trim(),
  });
  const parseTime = performance.now() - parseStart;

  console.log(
    `[fetchCSV] ${url.split('/').pop()}: fetch=${fetchTime.toFixed(0)}ms, parse=${parseTime.toFixed(0)}ms, rows=${result.data.length}`
  );

  return result.data;
}

// GitHub raw URL base for remote data
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/tabiya-tech/taxonomy-model-application/main/data-sets/csv';

// Cache for detected version folder
let versionCache: string | null = null;
let versionCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Clear cache on HMR (for development)
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    versionCache = null;
    versionCacheTime = 0;
  });
}

// Detect the latest Tabiya ESCO version folder from GitHub
async function detectLatestVersion(): Promise<string> {
  const now = Date.now();
  if (versionCache && (now - versionCacheTime) < CACHE_DURATION) {
    return versionCache;
  }

  try {
    const apiUrl = 'https://api.github.com/repos/tabiya-tech/taxonomy-model-application/contents/data-sets/csv';
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch version info');
    }
    const folders = await response.json();

    // Find Tabiya ESCO folders (format: "tabiya-esco-X.X.X vX.X.X")
    // These contain the full taxonomy including unseen economy (ICATUS) data
    const tabiyaFolders = folders
      .filter((f: { type: string; name: string }) =>
        f.type === 'dir' &&
        f.name.startsWith('tabiya-esco-') &&
        !f.name.includes('(') // Exclude language-specific
      )
      .map((f: { name: string }) => f.name)
      .sort((a: string, b: string) => b.localeCompare(a, undefined, { numeric: true }));

    console.log('[detectLatestVersion] Found Tabiya ESCO folders:', tabiyaFolders);

    if (tabiyaFolders.length > 0) {
      versionCache = tabiyaFolders[0] as string;
      versionCacheTime = now;
      console.log(`[detectLatestVersion] Using version: ${versionCache}`);
      return versionCache!;
    }
  } catch (error) {
    console.warn('[detectLatestVersion] Failed to detect version, using fallback:', error);
  }

  // Fallback to known working version with unseen economy data
  return 'tabiya-esco-1.1.1 v2.0.1';
}

// Get the base path for data files
async function getDataPath(lang: Language, loc: Localization): Promise<string> {
  // For Spanish or localized data, use local files
  if (lang === 'es') {
    return `/data/base/es`;
  }

  if (loc !== 'base') {
    return `/data/localized/${loc}/${lang}`;
  }

  // For English base data, use GitHub raw URLs for fast loading
  const version = await detectLatestVersion();
  return `${GITHUB_RAW_BASE}/${encodeURIComponent(version)}`;
}

// Transform occupation row to Occupation entity
function transformOccupation(row: OccupationRow): Occupation {
  return {
    id: row.ID,
    code: row.CODE,
    preferredLabel: row.PREFERREDLABEL,
    altLabels: parseAltLabels(row.ALTLABELS),
    description: row.DESCRIPTION || '',
    occupationType: row.OCCUPATIONTYPE as OccupationType,
    scopeNote: row.SCOPENOTE || '',
    definition: row.DEFINITION || '',
    isLocalized: row.ISLOCALIZED === 'true',
    entityType: 'occupation',
  };
}

// Transform occupation group row to OccupationGroup entity
function transformOccupationGroup(row: OccupationGroupRow): OccupationGroup {
  return {
    id: row.ID,
    code: row.CODE,
    preferredLabel: row.PREFERREDLABEL,
    altLabels: parseAltLabels(row.ALTLABELS),
    description: row.DESCRIPTION || '',
    groupType: (row.GROUPTYPE || 'iscogroup') as OccupationGroupType,
    isLocalized: false,
    entityType: 'occupationGroup',
  };
}

// Transform skill row to Skill entity
function transformSkill(row: SkillRow): Skill {
  return {
    id: row.ID,
    code: row.CODE || '',
    preferredLabel: row.PREFERREDLABEL,
    altLabels: parseAltLabels(row.ALTLABELS),
    description: row.DESCRIPTION || '',
    skillType: (row.SKILLTYPE || 'skill/competence') as SkillType,
    scopeNote: row.SCOPENOTE || '',
    reuseLevel: row.REUSELEVEL || '',
    isLocalized: row.ISLOCALIZED === 'true',
    entityType: 'skill',
  };
}

// Transform skill group row to SkillGroup entity
function transformSkillGroup(row: SkillGroupRow): SkillGroup {
  return {
    id: row.ID,
    code: row.CODE,
    preferredLabel: row.PREFERREDLABEL,
    altLabels: parseAltLabels(row.ALTLABELS),
    description: row.DESCRIPTION || '',
    scopeNote: row.SCOPENOTE || '',
    isLocalized: false,
    entityType: 'skillGroup',
  };
}

// Transform hierarchy row
function transformHierarchy(row: HierarchyRow): HierarchyRelation {
  return {
    parentId: row.PARENTID,
    childId: row.CHILDID,
    parentType: row.PARENTOBJECTTYPE,
    childType: row.CHILDOBJECTTYPE,
  };
}

// Transform relation row
function transformRelation(row: RelationRow): OccupationSkillRelation {
  return {
    occupationId: row.OCCUPATIONID,
    skillId: row.SKILLID,
    relationType: (row.RELATIONTYPE || '') as RelationType | '',
    signallingValue: row.SIGNALLINGVALUE
      ? parseFloat(row.SIGNALLINGVALUE)
      : null,
    signallingValueLabel: (row.SIGNALLINGVALUELABEL?.toLowerCase() || '') as 'high' | 'medium' | 'low' | '',
    occupationType: row.OCCUPATIONTYPE || '',
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
export function isUnseenEconomy(code: string): boolean {
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

// Main data loading function - OPTIMIZED
export async function loadTaxonomyData(
  lang: Language,
  loc: Localization
): Promise<TaxonomyData> {
  const totalStart = performance.now();
  const basePath = await getDataPath(lang, loc);
  console.log(`[loadTaxonomyData] Loading from ${basePath}...`);

  // Load all CSV files in parallel
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
    fetchCSV<OccupationRow>(`${basePath}/occupations.csv`),
    fetchCSV<OccupationGroupRow>(`${basePath}/occupation_groups.csv`),
    fetchCSV<SkillRow>(`${basePath}/skills.csv`),
    fetchCSV<SkillGroupRow>(`${basePath}/skill_groups.csv`),
    fetchCSV<HierarchyRow>(`${basePath}/occupation_hierarchy.csv`),
    fetchCSV<HierarchyRow>(`${basePath}/skill_hierarchy.csv`),
    fetchCSV<RelationRow>(`${basePath}/occupation_to_skill_relations.csv`),
  ]);
  console.log(`[loadTaxonomyData] All fetches complete in ${(performance.now() - fetchStart).toFixed(0)}ms`);

  // Transform to entity maps - use simple objects for speed
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

  console.log(`[loadTaxonomyData] Entity maps built in ${(performance.now() - transformStart).toFixed(0)}ms`);

  // Build hierarchy maps (fast - just indexing)
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

  console.log(`[loadTaxonomyData] Hierarchy maps built in ${(performance.now() - hierarchyStart).toFixed(0)}ms`);

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

  // Transform relations (keep raw - we index by occupation/skill on demand)
  const occupationToSkillRelations = relationRows.map(transformRelation);

  // Store hierarchy relations for breadcrumb building
  const occupationHierarchy = occupationHierarchyRows.map(transformHierarchy);
  const skillHierarchy = skillHierarchyRows.map(transformHierarchy);

  // Build LAZY trees - only root nodes, children built on-demand
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

  console.log(`[loadTaxonomyData] Lazy trees built in ${(performance.now() - treeStart).toFixed(0)}ms`);

  // Separate seen/unseen occupation roots
  const { seen: seenOccupationRoots, unseen: unseenOccupationRoots } =
    separateOccupationRoots(occupationTree, occupationGroups);

  const totalTime = performance.now() - totalStart;
  console.log(`[loadTaxonomyData] TOTAL: ${totalTime.toFixed(0)}ms`);
  console.log(`[loadTaxonomyData] Loaded: ${occupations.size} occupations, ${skills.size} skills, ${occupationToSkillRelations.length} relations`);

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
    // NEW: Store hierarchy maps for lazy child building
    occChildrenMap,
    occParentMap,
    skillChildrenMap,
    skillParentMap,
  };
}

// NEW: Build children for a node on-demand
export function getChildrenForNode(
  data: TaxonomyData,
  parentId: string,
  domain: 'occupations' | 'skills'
): TreeNode[] {
  const childrenMap = domain === 'occupations' ? data.occChildrenMap : data.skillChildrenMap;
  const parentMap = domain === 'occupations' ? data.occParentMap : data.skillParentMap;

  // Build combined entity map with proper typing
  const entities = new Map<string, { id: string; code: string; preferredLabel: string; isLocalized: boolean; entityType: string }>();
  if (domain === 'occupations') {
    for (const [id, entity] of data.occupations) {
      entities.set(id, entity);
    }
    for (const [id, entity] of data.occupationGroups) {
      entities.set(id, entity);
    }
  } else {
    for (const [id, entity] of data.skills) {
      entities.set(id, entity);
    }
    for (const [id, entity] of data.skillGroups) {
      entities.set(id, entity);
    }
  }

  const entityTypeForItem = domain === 'occupations' ? 'occupation' : 'skill';
  const entityTypeForGroup = domain === 'occupations' ? 'occupationGroup' : 'skillGroup';

  const childIds = childrenMap?.get(parentId) || [];
  const children: TreeNode[] = [];

  // Get parent depth
  let depth = 1;
  let currentId = parentId;
  while (parentMap?.has(currentId)) {
    depth++;
    currentId = parentMap.get(currentId)!;
  }

  for (const childId of childIds) {
    const entity = entities.get(childId);
    if (!entity) continue;

    const grandchildIds = childrenMap?.get(childId) || [];
    const isGroup =
      entity.entityType === entityTypeForGroup ||
      entity.entityType === 'occupationGroup' ||
      entity.entityType === 'skillGroup';

    children.push({
      id: entity.id,
      code: entity.code,
      label: entity.preferredLabel,
      entityType: (isGroup ? entityTypeForGroup : entityTypeForItem) as TreeNode['entityType'],
      isGroup,
      isLocalized: entity.isLocalized,
      children: [], // Children built on-demand!
      childCount: grandchildIds.length,
      depth,
      parentId,
    });
  }

  // Sort by code
  children.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  return children;
}

// Get related skills for an occupation
export function getRelatedSkills(
  data: TaxonomyData,
  occupationId: string
): { skill: Skill; relationType: RelationType | ''; signallingValue: number | null; signallingValueLabel: string }[] {
  const relations = data.occupationToSkillRelations.filter(
    (rel) => rel.occupationId === occupationId
  );

  return relations
    .map((rel) => {
      const skill = data.skills.get(rel.skillId);
      if (!skill) return null;
      return {
        skill,
        relationType: rel.relationType,
        signallingValue: rel.signallingValue,
        signallingValueLabel: rel.signallingValueLabel,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => {
      // For seen economy: Essential skills first
      // For unseen economy: High signalling first
      if (a.signallingValueLabel || b.signallingValueLabel) {
        const order = { high: 0, medium: 1, low: 2, '': 3 };
        const aOrder = order[a.signallingValueLabel as keyof typeof order] ?? 3;
        const bOrder = order[b.signallingValueLabel as keyof typeof order] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
      } else if (a.relationType !== b.relationType) {
        return a.relationType === 'essential' ? -1 : 1;
      }
      return a.skill.preferredLabel.localeCompare(b.skill.preferredLabel);
    });
}

// Get related occupations for a skill
export function getRelatedOccupations(
  data: TaxonomyData,
  skillId: string
): { occupation: Occupation; relationType: RelationType | ''; signallingValue: number | null }[] {
  const relations = data.occupationToSkillRelations.filter(
    (rel) => rel.skillId === skillId
  );

  return relations
    .map((rel) => {
      const occupation = data.occupations.get(rel.occupationId);
      if (!occupation) return null;
      return {
        occupation,
        relationType: rel.relationType,
        signallingValue: rel.signallingValue,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) =>
      a.occupation.preferredLabel.localeCompare(b.occupation.preferredLabel)
    );
}

// Get breadcrumb path for an item
export function getBreadcrumbPath(
  data: TaxonomyData,
  itemId: string,
  itemType: 'occupation' | 'occupationGroup' | 'skill' | 'skillGroup'
): { id: string; label: string; type: typeof itemType }[] {
  const path: { id: string; label: string; type: typeof itemType }[] = [];

  // Determine which parent map to use
  const parentMap =
    itemType === 'occupation' || itemType === 'occupationGroup'
      ? data.occParentMap
      : data.skillParentMap;

  // Get all entity maps for lookup
  const allEntities = new Map<string, { preferredLabel: string; entityType: string }>();
  if (itemType === 'occupation' || itemType === 'occupationGroup') {
    for (const [id, entity] of data.occupations) {
      allEntities.set(id, entity);
    }
    for (const [id, entity] of data.occupationGroups) {
      allEntities.set(id, entity);
    }
  } else {
    for (const [id, entity] of data.skills) {
      allEntities.set(id, entity);
    }
    for (const [id, entity] of data.skillGroups) {
      allEntities.set(id, entity);
    }
  }

  // Walk up the hierarchy
  let currentId: string | undefined = itemId;
  while (currentId) {
    const entity = allEntities.get(currentId);
    if (entity) {
      path.unshift({
        id: currentId,
        label: entity.preferredLabel,
        type: entity.entityType as typeof itemType,
      });
    }
    currentId = parentMap?.get(currentId);
  }

  return path;
}

// Find item by code
export function findByCode(
  data: TaxonomyData,
  code: string,
  domain: 'occupations' | 'skills'
): Occupation | OccupationGroup | Skill | SkillGroup | null {
  if (domain === 'occupations') {
    return data.occupationsByCode.get(code) ?? null;
  }
  return data.skillsByCode.get(code) ?? null;
}

// Get children for an occupation group (sub-groups and occupations)
export function getOccupationGroupChildren(
  data: TaxonomyData,
  groupId: string
): { subGroups: OccupationGroup[]; occupations: Occupation[] } {
  const childIds = data.occChildrenMap.get(groupId) || [];
  const subGroups: OccupationGroup[] = [];
  const occupations: Occupation[] = [];

  for (const childId of childIds) {
    const group = data.occupationGroups.get(childId);
    if (group) {
      subGroups.push(group);
      continue;
    }
    const occupation = data.occupations.get(childId);
    if (occupation) {
      occupations.push(occupation);
    }
  }

  // Sort by code
  subGroups.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  occupations.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  return { subGroups, occupations };
}

// Get children for a skill group (sub-groups and skills)
export function getSkillGroupChildren(
  data: TaxonomyData,
  groupId: string
): { subGroups: SkillGroup[]; skills: Skill[] } {
  const childIds = data.skillChildrenMap.get(groupId) || [];
  const subGroups: SkillGroup[] = [];
  const skills: Skill[] = [];

  for (const childId of childIds) {
    const group = data.skillGroups.get(childId);
    if (group) {
      subGroups.push(group);
      continue;
    }
    const skill = data.skills.get(childId);
    if (skill) {
      skills.push(skill);
    }
  }

  // Sort by code (skill groups) or label (skills - many have no code)
  subGroups.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  skills.sort((a, b) => a.preferredLabel.localeCompare(b.preferredLabel));

  return { subGroups, skills };
}
