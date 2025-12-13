import { useState, useCallback, useMemo } from 'react';
import type {
  GraphNode,
  GraphEdge,
  GraphState,
  NodeType,
  EdgeType,
} from './networkTypes';
import { MAX_NODES } from './networkTypes';
import type { TaxonomyData } from '@/types/taxonomy';
import { getRelatedSkills, getRelatedOccupations } from '@/services/dataLoader';

/**
 * Mock data for prototype development
 * This will be replaced with real taxonomy data
 */
const MOCK_OCCUPATIONS: Record<string, { code: string; label: string }> = {
  'occ-1': { code: '6111.1', label: 'Crop Farmer' },
  'occ-2': { code: '6112.1', label: 'Gardener' },
  'occ-3': { code: '6113.1', label: 'Landscaper' },
  'occ-4': { code: '6114.1', label: 'Groundskeeper' },
  'occ-5': { code: '7231.1', label: 'Farm Equipment Operator' },
};

const MOCK_SKILLS: Record<string, { code: string; label: string }> = {
  'skill-1': { code: 'S1.1', label: 'Soil Preparation' },
  'skill-2': { code: 'S1.2', label: 'Harvest Techniques' },
  'skill-3': { code: 'S1.3', label: 'Irrigation Management' },
  'skill-4': { code: 'S1.4', label: 'Operate Farming Machinery' },
  'skill-5': { code: 'S1.5', label: 'Plant Care' },
  'skill-6': { code: 'S1.6', label: 'Pruning Skills' },
  'skill-7': { code: 'S1.7', label: 'Pest Control' },
  'skill-8': { code: 'S1.8', label: 'Landscape Design' },
};

/**
 * Mock relations for prototype
 * Maps occupation ID -> array of { skillId, relationType, signallingValue }
 */
const MOCK_OCC_TO_SKILLS: Record<
  string,
  Array<{ skillId: string; relationType: EdgeType; signallingValue: number }>
> = {
  'occ-1': [
    { skillId: 'skill-1', relationType: 'essential', signallingValue: 0.9 },
    { skillId: 'skill-2', relationType: 'essential', signallingValue: 0.85 },
    { skillId: 'skill-3', relationType: 'essential', signallingValue: 0.8 },
    { skillId: 'skill-4', relationType: 'optional', signallingValue: 0.6 },
    { skillId: 'skill-7', relationType: 'optional', signallingValue: 0.5 },
  ],
  'occ-2': [
    { skillId: 'skill-1', relationType: 'essential', signallingValue: 0.85 },
    { skillId: 'skill-5', relationType: 'essential', signallingValue: 0.9 },
    { skillId: 'skill-6', relationType: 'essential', signallingValue: 0.8 },
    { skillId: 'skill-7', relationType: 'optional', signallingValue: 0.6 },
  ],
  'occ-3': [
    { skillId: 'skill-1', relationType: 'essential', signallingValue: 0.7 },
    { skillId: 'skill-5', relationType: 'essential', signallingValue: 0.75 },
    { skillId: 'skill-8', relationType: 'essential', signallingValue: 0.9 },
    { skillId: 'skill-6', relationType: 'optional', signallingValue: 0.5 },
  ],
  'occ-4': [
    { skillId: 'skill-1', relationType: 'essential', signallingValue: 0.8 },
    { skillId: 'skill-5', relationType: 'essential', signallingValue: 0.7 },
    { skillId: 'skill-4', relationType: 'optional', signallingValue: 0.4 },
  ],
  'occ-5': [
    { skillId: 'skill-4', relationType: 'essential', signallingValue: 0.95 },
    { skillId: 'skill-1', relationType: 'optional', signallingValue: 0.5 },
  ],
};

/**
 * Reverse lookup: skill -> occupations
 */
function getMockSkillToOccupations(
  skillId: string
): Array<{ occId: string; relationType: EdgeType; signallingValue: number }> {
  const results: Array<{
    occId: string;
    relationType: EdgeType;
    signallingValue: number;
  }> = [];

  for (const [occId, skills] of Object.entries(MOCK_OCC_TO_SKILLS)) {
    const relation = skills.find((s) => s.skillId === skillId);
    if (relation) {
      results.push({
        occId,
        relationType: relation.relationType,
        signallingValue: relation.signallingValue,
      });
    }
  }

  return results;
}

/**
 * Build a graph centered on a specific node using mock data
 */
function buildMockGraph(
  centerId: string,
  centerType: NodeType
): GraphState {
  const nodes: Map<string, GraphNode> = new Map();
  const edges: GraphEdge[] = [];

  // 1. Add center node (distance 0)
  const centerEntity =
    centerType === 'occupation'
      ? MOCK_OCCUPATIONS[centerId]
      : MOCK_SKILLS[centerId];

  if (!centerEntity) {
    return {
      nodes: [],
      edges: [],
      centerNodeId: centerId,
      centerNodeType: centerType,
      history: [],
    };
  }

  nodes.set(centerId, {
    id: centerId,
    code: centerEntity.code,
    label: centerEntity.label,
    type: centerType,
    distance: 0,
  });

  // 2. Get distance-1 nodes (direct connections)
  if (centerType === 'occupation') {
    const relations = MOCK_OCC_TO_SKILLS[centerId] || [];
    for (const rel of relations) {
      const skill = MOCK_SKILLS[rel.skillId];
      if (!skill) continue;

      nodes.set(rel.skillId, {
        id: rel.skillId,
        code: skill.code,
        label: skill.label,
        type: 'skill',
        distance: 1,
        signallingValue: rel.signallingValue,
      });

      edges.push({
        id: `${centerId}-${rel.skillId}`,
        source: centerId,
        target: rel.skillId,
        relationType: rel.relationType,
        signallingValue: rel.signallingValue,
      });
    }
  } else {
    // Center is a skill, get related occupations
    const relations = getMockSkillToOccupations(centerId);
    for (const rel of relations) {
      const occ = MOCK_OCCUPATIONS[rel.occId];
      if (!occ) continue;

      nodes.set(rel.occId, {
        id: rel.occId,
        code: occ.code,
        label: occ.label,
        type: 'occupation',
        distance: 1,
        signallingValue: rel.signallingValue,
      });

      edges.push({
        id: `${centerId}-${rel.occId}`,
        source: centerId,
        target: rel.occId,
        relationType: rel.relationType,
        signallingValue: rel.signallingValue,
      });
    }
  }

  // 3. Get distance-2 nodes (connections of connections)
  const distance1Nodes = Array.from(nodes.values()).filter(
    (n) => n.distance === 1
  );

  for (const d1Node of distance1Nodes) {
    if (nodes.size >= MAX_NODES) break;

    if (d1Node.type === 'skill') {
      // Get occupations that use this skill
      const relations = getMockSkillToOccupations(d1Node.id);
      for (const rel of relations) {
        if (nodes.size >= MAX_NODES) break;

        // Skip if already in graph
        if (nodes.has(rel.occId)) {
          // Add edge if not already present
          const edgeId = `${d1Node.id}-${rel.occId}`;
          if (!edges.some((e) => e.id === edgeId)) {
            edges.push({
              id: edgeId,
              source: d1Node.id,
              target: rel.occId,
              relationType: rel.relationType,
              signallingValue: rel.signallingValue,
            });
          }
          continue;
        }

        const occ = MOCK_OCCUPATIONS[rel.occId];
        if (!occ) continue;

        nodes.set(rel.occId, {
          id: rel.occId,
          code: occ.code,
          label: occ.label,
          type: 'occupation',
          distance: 2,
          signallingValue: rel.signallingValue,
        });

        edges.push({
          id: `${d1Node.id}-${rel.occId}`,
          source: d1Node.id,
          target: rel.occId,
          relationType: rel.relationType,
          signallingValue: rel.signallingValue,
        });
      }
    } else {
      // Get skills for this occupation
      const relations = MOCK_OCC_TO_SKILLS[d1Node.id] || [];
      for (const rel of relations) {
        if (nodes.size >= MAX_NODES) break;

        // Skip if already in graph
        if (nodes.has(rel.skillId)) {
          const edgeId = `${d1Node.id}-${rel.skillId}`;
          if (!edges.some((e) => e.id === edgeId)) {
            edges.push({
              id: edgeId,
              source: d1Node.id,
              target: rel.skillId,
              relationType: rel.relationType,
              signallingValue: rel.signallingValue,
            });
          }
          continue;
        }

        const skill = MOCK_SKILLS[rel.skillId];
        if (!skill) continue;

        nodes.set(rel.skillId, {
          id: rel.skillId,
          code: skill.code,
          label: skill.label,
          type: 'skill',
          distance: 2,
          signallingValue: rel.signallingValue,
        });

        edges.push({
          id: `${d1Node.id}-${rel.skillId}`,
          source: d1Node.id,
          target: rel.skillId,
          relationType: rel.relationType,
          signallingValue: rel.signallingValue,
        });
      }
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    edges,
    centerNodeId: centerId,
    centerNodeType: centerType,
    history: [{ id: centerId, label: centerEntity.label, type: centerType }],
  };
}

/**
 * Build a graph centered on a specific node using real taxonomy data
 */
function buildGraphFromTaxonomy(
  centerId: string,
  centerType: NodeType,
  taxonomyData: TaxonomyData
): GraphState {
  const nodes: Map<string, GraphNode> = new Map();
  const edges: GraphEdge[] = [];

  // 1. Get center entity
  const centerEntity =
    centerType === 'occupation'
      ? taxonomyData.occupations.get(centerId)
      : taxonomyData.skills.get(centerId);

  if (!centerEntity) {
    return {
      nodes: [],
      edges: [],
      centerNodeId: centerId,
      centerNodeType: centerType,
      history: [],
    };
  }

  nodes.set(centerId, {
    id: centerId,
    code: centerEntity.code,
    label: centerEntity.preferredLabel,
    type: centerType,
    distance: 0,
  });

  // 2. Get distance-1 nodes
  if (centerType === 'occupation') {
    const relatedSkills = getRelatedSkills(taxonomyData, centerId);
    for (const rel of relatedSkills) {
      nodes.set(rel.skill.id, {
        id: rel.skill.id,
        code: rel.skill.code,
        label: rel.skill.preferredLabel,
        type: 'skill',
        distance: 1,
        signallingValue: rel.signallingValue ?? undefined,
      });

      edges.push({
        id: `${centerId}-${rel.skill.id}`,
        source: centerId,
        target: rel.skill.id,
        relationType: (rel.relationType || 'optional') as EdgeType,
        signallingValue: rel.signallingValue ?? undefined,
      });
    }
  } else {
    const relatedOccs = getRelatedOccupations(taxonomyData, centerId);
    for (const rel of relatedOccs) {
      nodes.set(rel.occupation.id, {
        id: rel.occupation.id,
        code: rel.occupation.code,
        label: rel.occupation.preferredLabel,
        type: 'occupation',
        distance: 1,
        signallingValue: rel.signallingValue ?? undefined,
      });

      edges.push({
        id: `${centerId}-${rel.occupation.id}`,
        source: centerId,
        target: rel.occupation.id,
        relationType: (rel.relationType || 'optional') as EdgeType,
        signallingValue: rel.signallingValue ?? undefined,
      });
    }
  }

  // 3. Get distance-2 nodes (limit to keep graph manageable)
  const distance1Nodes = Array.from(nodes.values()).filter(
    (n) => n.distance === 1
  );

  for (const d1Node of distance1Nodes) {
    if (nodes.size >= MAX_NODES) break;

    if (d1Node.type === 'skill') {
      const relations = getRelatedOccupations(taxonomyData, d1Node.id);
      for (const rel of relations.slice(0, 5)) {
        // Limit per node
        if (nodes.size >= MAX_NODES) break;

        if (nodes.has(rel.occupation.id)) {
          const edgeId = `${d1Node.id}-${rel.occupation.id}`;
          if (!edges.some((e) => e.id === edgeId)) {
            edges.push({
              id: edgeId,
              source: d1Node.id,
              target: rel.occupation.id,
              relationType: (rel.relationType || 'optional') as EdgeType,
              signallingValue: rel.signallingValue ?? undefined,
            });
          }
          continue;
        }

        nodes.set(rel.occupation.id, {
          id: rel.occupation.id,
          code: rel.occupation.code,
          label: rel.occupation.preferredLabel,
          type: 'occupation',
          distance: 2,
          signallingValue: rel.signallingValue ?? undefined,
        });

        edges.push({
          id: `${d1Node.id}-${rel.occupation.id}`,
          source: d1Node.id,
          target: rel.occupation.id,
          relationType: (rel.relationType || 'optional') as EdgeType,
          signallingValue: rel.signallingValue ?? undefined,
        });
      }
    } else {
      const relations = getRelatedSkills(taxonomyData, d1Node.id);
      for (const rel of relations.slice(0, 5)) {
        if (nodes.size >= MAX_NODES) break;

        if (nodes.has(rel.skill.id)) {
          const edgeId = `${d1Node.id}-${rel.skill.id}`;
          if (!edges.some((e) => e.id === edgeId)) {
            edges.push({
              id: edgeId,
              source: d1Node.id,
              target: rel.skill.id,
              relationType: (rel.relationType || 'optional') as EdgeType,
              signallingValue: rel.signallingValue ?? undefined,
            });
          }
          continue;
        }

        nodes.set(rel.skill.id, {
          id: rel.skill.id,
          code: rel.skill.code,
          label: rel.skill.preferredLabel,
          type: 'skill',
          distance: 2,
          signallingValue: rel.signallingValue ?? undefined,
        });

        edges.push({
          id: `${d1Node.id}-${rel.skill.id}`,
          source: d1Node.id,
          target: rel.skill.id,
          relationType: (rel.relationType || 'optional') as EdgeType,
          signallingValue: rel.signallingValue ?? undefined,
        });
      }
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    edges,
    centerNodeId: centerId,
    centerNodeType: centerType,
    history: [
      { id: centerId, label: centerEntity.preferredLabel, type: centerType },
    ],
  };
}

export interface UseNetworkDataOptions {
  initialNodeId: string;
  initialNodeType: NodeType;
  initialNodeLabel: string;
  taxonomyData?: TaxonomyData | null;
  useMockData?: boolean;
}

export interface UseNetworkDataResult {
  graphState: GraphState;
  recenter: (nodeId: string) => void;
  goBack: () => void;
  canGoBack: boolean;
}

/**
 * Hook to manage network graph data and navigation
 */
export function useNetworkData(
  options: UseNetworkDataOptions
): UseNetworkDataResult {
  const {
    initialNodeId,
    initialNodeType,
    taxonomyData,
    useMockData = false,
  } = options;

  // Build initial graph
  const initialGraph = useMemo(() => {
    if (useMockData || !taxonomyData) {
      return buildMockGraph(initialNodeId, initialNodeType);
    }
    return buildGraphFromTaxonomy(initialNodeId, initialNodeType, taxonomyData);
  }, [initialNodeId, initialNodeType, taxonomyData, useMockData]);

  const [graphState, setGraphState] = useState<GraphState>(initialGraph);

  /**
   * Recenter the graph on a different node
   */
  const recenter = useCallback(
    (nodeId: string) => {
      const clickedNode = graphState.nodes.find((n) => n.id === nodeId);
      if (!clickedNode || clickedNode.distance === 0) {
        return; // Already center or not found
      }

      // Build new graph centered on clicked node
      let newGraph: GraphState;
      if (useMockData || !taxonomyData) {
        newGraph = buildMockGraph(nodeId, clickedNode.type);
      } else {
        newGraph = buildGraphFromTaxonomy(
          nodeId,
          clickedNode.type,
          taxonomyData
        );
      }

      // Preserve positions for nodes that exist in both graphs
      for (const newNode of newGraph.nodes) {
        const oldNode = graphState.nodes.find((n) => n.id === newNode.id);
        if (oldNode && oldNode.x !== undefined && oldNode.y !== undefined) {
          newNode.x = oldNode.x;
          newNode.y = oldNode.y;
        }
      }

      // Update navigation history
      newGraph.history = [
        ...graphState.history,
        { id: nodeId, label: clickedNode.label, type: clickedNode.type },
      ];

      setGraphState(newGraph);
    },
    [graphState, taxonomyData, useMockData]
  );

  /**
   * Go back to previous node in history
   */
  const goBack = useCallback(() => {
    if (graphState.history.length <= 1) return;

    const newHistory = graphState.history.slice(0, -1);
    const previousEntry = newHistory[newHistory.length - 1];

    // Guard against undefined (shouldn't happen but TypeScript needs it)
    if (!previousEntry) return;

    let newGraph: GraphState;
    if (useMockData || !taxonomyData) {
      newGraph = buildMockGraph(previousEntry.id, previousEntry.type);
    } else {
      newGraph = buildGraphFromTaxonomy(
        previousEntry.id,
        previousEntry.type,
        taxonomyData
      );
    }

    newGraph.history = newHistory;
    setGraphState(newGraph);
  }, [graphState.history, taxonomyData, useMockData]);

  const canGoBack = graphState.history.length > 1;

  return {
    graphState,
    recenter,
    goBack,
    canGoBack,
  };
}

// Export mock data for testing
export const MOCK_DATA = {
  MOCK_OCCUPATIONS,
  MOCK_SKILLS,
  MOCK_OCC_TO_SKILLS,
};
