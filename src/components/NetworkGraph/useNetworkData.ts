import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  GraphNode,
  GraphEdge,
  GraphState,
  NodeType,
  EdgeType,
  TruncationStats,
} from './networkTypes';
import type { TaxonomyData } from '@/types/taxonomy';
import { getRelatedSkills, getRelatedOccupations } from '@/services/dataLoader';
import {
  loadCentralityData,
  getSkillCentrality,
  getSkillDegree,
  getOccupationCentrality,
  type CentralityData,
} from '@/services/centralityLoader';

/**
 * Graded limits for each distance level
 */
const LIMITS = {
  dist1: 20,  // Top 20 direct connections
  dist2: 15,  // Top 15 per distance-1 node
  dist3: 10,  // Top 10 per distance-2 node
};

/**
 * Build a graded 3-degree graph with top-N limits at each level
 *
 * For occupation-centered:
 *   Distance 0: Center occupation
 *   Distance 1: Top 20 skills (by skill degree)
 *   Distance 2: Top 15 occupations per skill (by occ centrality)
 *   Distance 3: Top 10 skills per distance-2 occupation (by skill degree)
 *
 * For skill-centered:
 *   Distance 0: Center skill
 *   Distance 1: Top 20 occupations (by occ centrality)
 *   Distance 2: Top 15 skills per occupation (by skill degree)
 *   Distance 3: Top 10 occupations per distance-2 skill (by occ centrality)
 */
function buildThreeDegreeGraph(
  centerId: string,
  centerType: NodeType,
  taxonomyData: TaxonomyData,
  centralityData: CentralityData | null
): GraphState {
  const nodes: Map<string, GraphNode> = new Map();
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // Track edge IDs for deduplication

  // Track truncation stats
  const stats: TruncationStats = {
    dist1: { shown: 0, total: 0 },
    dist2: { shown: 0, total: 0 },
    dist3: { shown: 0, total: 0 },
  };

  // Get center entity
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

  // Get centrality for center node
  const centerCentrality =
    centerType === 'occupation'
      ? getOccupationCentrality(centralityData, centerId)
      : getSkillCentrality(centralityData, centerId);

  const centerDegree =
    centerType === 'skill' ? getSkillDegree(centralityData, centerId) : undefined;

  // Add center node (distance 0)
  nodes.set(centerId, {
    id: centerId,
    code: centerEntity.code,
    label: centerEntity.preferredLabel,
    type: centerType,
    distance: 0,
    centrality: centerCentrality,
    degree: centerDegree,
  });

  // Track which node IDs are at distance 1 for filtering at distance 3
  const dist1Ids = new Set<string>();

  if (centerType === 'occupation') {
    // === OCCUPATION-CENTERED GRAPH ===

    // Distance 1: Get all skills, sort by centrality, take top N
    const allDist1 = getRelatedSkills(taxonomyData, centerId);
    stats.dist1.total = allDist1.length;

    const topDist1 = allDist1
      .map(rel => ({
        ...rel,
        centrality: getSkillCentrality(centralityData, rel.skill.id),
        degree: getSkillDegree(centralityData, rel.skill.id),
      }))
      .sort((a, b) => (b.centrality ?? 0) - (a.centrality ?? 0))
      .slice(0, LIMITS.dist1);

    stats.dist1.shown = topDist1.length;

    // Add distance-1 skills
    for (const rel of topDist1) {
      dist1Ids.add(rel.skill.id);

      nodes.set(rel.skill.id, {
        id: rel.skill.id,
        code: rel.skill.code,
        label: rel.skill.preferredLabel,
        type: 'skill',
        distance: 1,
        signallingValue: rel.signallingValue ?? undefined,
        centrality: rel.centrality,
        degree: rel.degree,
      });

      const edgeId = `${centerId}-${rel.skill.id}`;
      if (!edgeSet.has(edgeId)) {
        edgeSet.add(edgeId);
        edges.push({
          id: edgeId,
          source: centerId,
          target: rel.skill.id,
          relationType: (rel.relationType || 'optional') as EdgeType,
          signallingValue: rel.signallingValue ?? undefined,
        });
      }

      // Distance 2: Get occupations for this skill, sort by centrality, take top N
      const allDist2 = getRelatedOccupations(taxonomyData, rel.skill.id)
        .filter(o => o.occupation.id !== centerId);
      stats.dist2.total += allDist2.length;

      const topDist2 = allDist2
        .map(occRel => ({
          ...occRel,
          centrality: getOccupationCentrality(centralityData, occRel.occupation.id),
        }))
        .sort((a, b) => (b.centrality ?? 0) - (a.centrality ?? 0))
        .slice(0, LIMITS.dist2);

      stats.dist2.shown += topDist2.length;

      for (const occRel of topDist2) {
        // Add occupation node if not exists
        if (!nodes.has(occRel.occupation.id)) {
          nodes.set(occRel.occupation.id, {
            id: occRel.occupation.id,
            code: occRel.occupation.code,
            label: occRel.occupation.preferredLabel,
            type: 'occupation',
            distance: 2,
            centrality: occRel.centrality,
          });
        }

        // Add edge skill -> occupation
        const edgeId2 = `${rel.skill.id}-${occRel.occupation.id}`;
        if (!edgeSet.has(edgeId2)) {
          edgeSet.add(edgeId2);
          edges.push({
            id: edgeId2,
            source: rel.skill.id,
            target: occRel.occupation.id,
            relationType: (occRel.relationType || 'optional') as EdgeType,
            signallingValue: occRel.signallingValue ?? undefined,
          });
        }

        // Distance 3: Get skills for this distance-2 occupation
        const allDist3 = getRelatedSkills(taxonomyData, occRel.occupation.id)
          .filter(s => s.skill.id !== centerId && !dist1Ids.has(s.skill.id));
        stats.dist3.total += allDist3.length;

        const topDist3 = allDist3
          .map(skillRel => ({
            ...skillRel,
            centrality: getSkillCentrality(centralityData, skillRel.skill.id),
            degree: getSkillDegree(centralityData, skillRel.skill.id),
          }))
          .sort((a, b) => (b.centrality ?? 0) - (a.centrality ?? 0))
          .slice(0, LIMITS.dist3);

        stats.dist3.shown += topDist3.length;

        for (const skillRel of topDist3) {
          // Add skill node if not exists
          if (!nodes.has(skillRel.skill.id)) {
            nodes.set(skillRel.skill.id, {
              id: skillRel.skill.id,
              code: skillRel.skill.code,
              label: skillRel.skill.preferredLabel,
              type: 'skill',
              distance: 3,
              centrality: skillRel.centrality,
              degree: skillRel.degree,
            });
          }

          // Add edge occupation -> skill
          const edgeId3 = `${occRel.occupation.id}-${skillRel.skill.id}`;
          if (!edgeSet.has(edgeId3)) {
            edgeSet.add(edgeId3);
            edges.push({
              id: edgeId3,
              source: occRel.occupation.id,
              target: skillRel.skill.id,
              relationType: (skillRel.relationType || 'optional') as EdgeType,
              signallingValue: skillRel.signallingValue ?? undefined,
            });
          }
        }
      }
    }
  } else {
    // === SKILL-CENTERED GRAPH ===

    // Distance 1: Get all occupations, sort by centrality, take top N
    const allDist1 = getRelatedOccupations(taxonomyData, centerId);
    stats.dist1.total = allDist1.length;

    const topDist1 = allDist1
      .map(rel => ({
        ...rel,
        centrality: getOccupationCentrality(centralityData, rel.occupation.id),
      }))
      .sort((a, b) => (b.centrality ?? 0) - (a.centrality ?? 0))
      .slice(0, LIMITS.dist1);

    stats.dist1.shown = topDist1.length;

    // Add distance-1 occupations
    for (const rel of topDist1) {
      dist1Ids.add(rel.occupation.id);

      nodes.set(rel.occupation.id, {
        id: rel.occupation.id,
        code: rel.occupation.code,
        label: rel.occupation.preferredLabel,
        type: 'occupation',
        distance: 1,
        signallingValue: rel.signallingValue ?? undefined,
        centrality: rel.centrality,
      });

      const edgeId = `${centerId}-${rel.occupation.id}`;
      if (!edgeSet.has(edgeId)) {
        edgeSet.add(edgeId);
        edges.push({
          id: edgeId,
          source: centerId,
          target: rel.occupation.id,
          relationType: (rel.relationType || 'optional') as EdgeType,
          signallingValue: rel.signallingValue ?? undefined,
        });
      }

      // Distance 2: Get skills for this occupation, sort by centrality, take top N
      const allDist2 = getRelatedSkills(taxonomyData, rel.occupation.id)
        .filter(s => s.skill.id !== centerId);
      stats.dist2.total += allDist2.length;

      const topDist2 = allDist2
        .map(skillRel => ({
          ...skillRel,
          centrality: getSkillCentrality(centralityData, skillRel.skill.id),
          degree: getSkillDegree(centralityData, skillRel.skill.id),
        }))
        .sort((a, b) => (b.centrality ?? 0) - (a.centrality ?? 0))
        .slice(0, LIMITS.dist2);

      stats.dist2.shown += topDist2.length;

      for (const skillRel of topDist2) {
        // Add skill node if not exists
        if (!nodes.has(skillRel.skill.id)) {
          nodes.set(skillRel.skill.id, {
            id: skillRel.skill.id,
            code: skillRel.skill.code,
            label: skillRel.skill.preferredLabel,
            type: 'skill',
            distance: 2,
            centrality: skillRel.centrality,
            degree: skillRel.degree,
          });
        }

        // Add edge occupation -> skill
        const edgeId2 = `${rel.occupation.id}-${skillRel.skill.id}`;
        if (!edgeSet.has(edgeId2)) {
          edgeSet.add(edgeId2);
          edges.push({
            id: edgeId2,
            source: rel.occupation.id,
            target: skillRel.skill.id,
            relationType: (skillRel.relationType || 'optional') as EdgeType,
            signallingValue: skillRel.signallingValue ?? undefined,
          });
        }

        // Distance 3: Get occupations for this distance-2 skill
        const allDist3 = getRelatedOccupations(taxonomyData, skillRel.skill.id)
          .filter(o => o.occupation.id !== centerId && !dist1Ids.has(o.occupation.id));
        stats.dist3.total += allDist3.length;

        const topDist3 = allDist3
          .map(occRel => ({
            ...occRel,
            centrality: getOccupationCentrality(centralityData, occRel.occupation.id),
          }))
          .sort((a, b) => (b.centrality ?? 0) - (a.centrality ?? 0))
          .slice(0, LIMITS.dist3);

        stats.dist3.shown += topDist3.length;

        for (const occRel of topDist3) {
          // Add occupation node if not exists
          if (!nodes.has(occRel.occupation.id)) {
            nodes.set(occRel.occupation.id, {
              id: occRel.occupation.id,
              code: occRel.occupation.code,
              label: occRel.occupation.preferredLabel,
              type: 'occupation',
              distance: 3,
              centrality: occRel.centrality,
            });
          }

          // Add edge skill -> occupation
          const edgeId3 = `${skillRel.skill.id}-${occRel.occupation.id}`;
          if (!edgeSet.has(edgeId3)) {
            edgeSet.add(edgeId3);
            edges.push({
              id: edgeId3,
              source: skillRel.skill.id,
              target: occRel.occupation.id,
              relationType: (occRel.relationType || 'optional') as EdgeType,
              signallingValue: occRel.signallingValue ?? undefined,
            });
          }
        }
      }
    }
  }

  // Determine if truncation occurred
  const isTruncated =
    stats.dist1.shown < stats.dist1.total ||
    stats.dist2.shown < stats.dist2.total ||
    stats.dist3.shown < stats.dist3.total;

  // Count final nodes by distance for logging
  const dist0 = Array.from(nodes.values()).filter(n => n.distance === 0).length;
  const dist1 = Array.from(nodes.values()).filter(n => n.distance === 1).length;
  const dist2 = Array.from(nodes.values()).filter(n => n.distance === 2).length;
  const dist3 = Array.from(nodes.values()).filter(n => n.distance === 3).length;

  console.log(`[useNetworkData] 3-degree graph: ${dist0} center, ${dist1} dist-1, ${dist2} dist-2, ${dist3} dist-3 (total: ${nodes.size} nodes, ${edges.length} edges)`);
  console.log(`[useNetworkData] Truncation: dist1=${stats.dist1.shown}/${stats.dist1.total}, dist2=${stats.dist2.shown}/${stats.dist2.total}, dist3=${stats.dist3.shown}/${stats.dist3.total}`);

  return {
    nodes: Array.from(nodes.values()),
    edges,
    centerNodeId: centerId,
    centerNodeType: centerType,
    history: [
      { id: centerId, label: centerEntity.preferredLabel, type: centerType },
    ],
    isTruncated,
    truncationStats: stats,
  };
}

/**
 * Build graph (now always uses 3-degree with graded limits)
 */
function buildGraph(
  centerId: string,
  centerType: NodeType,
  taxonomyData: TaxonomyData,
  centralityData: CentralityData | null
): GraphState {
  return buildThreeDegreeGraph(centerId, centerType, taxonomyData, centralityData);
}

export interface UseNetworkDataOptions {
  initialNodeId: string;
  initialNodeType: NodeType;
  initialNodeLabel: string;
  taxonomyData?: TaxonomyData | null;
}

export interface UseNetworkDataResult {
  graphState: GraphState;
  recenter: (nodeId: string) => void;
  goBack: () => void;
  canGoBack: boolean;
  isLoading: boolean;
}

/**
 * Hook to manage network graph data and navigation
 */
export function useNetworkData(
  options: UseNetworkDataOptions
): UseNetworkDataResult {
  const { initialNodeId, initialNodeType, taxonomyData } = options;

  const [centralityData, setCentralityData] = useState<CentralityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [graphState, setGraphState] = useState<GraphState>({
    nodes: [],
    edges: [],
    centerNodeId: initialNodeId,
    centerNodeType: initialNodeType,
    history: [],
  });
  const hasInitialized = useRef(false);

  // Load centrality data on mount
  useEffect(() => {
    loadCentralityData()
      .then((data) => {
        setCentralityData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('[useNetworkData] Failed to load centrality:', error);
        setIsLoading(false);
      });
  }, []);

  // Build graph ONCE when both taxonomy and centrality are ready
  useEffect(() => {
    if (!taxonomyData || hasInitialized.current) return;

    // Build graph (centrality may or may not be loaded yet)
    const graph = buildGraph(initialNodeId, initialNodeType, taxonomyData, centralityData);
    setGraphState(graph);

    // Mark as initialized once we have centrality OR after a short delay
    if (centralityData) {
      hasInitialized.current = true;
    }
  }, [taxonomyData, centralityData, initialNodeId, initialNodeType]);

  // If centrality loads after initial graph, update centrality values on existing nodes
  // but DON'T rebuild the graph (to avoid position reset)
  useEffect(() => {
    if (!centralityData || !hasInitialized.current) return;

    // Just update centrality values on existing nodes
    setGraphState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({
        ...node,
        centrality: node.type === 'skill'
          ? getSkillCentrality(centralityData, node.id)
          : getOccupationCentrality(centralityData, node.id),
        degree: node.type === 'skill'
          ? getSkillDegree(centralityData, node.id)
          : undefined,
      })),
    }));
    hasInitialized.current = true;
  }, [centralityData]);

  /**
   * Recenter the graph on a different node
   */
  const recenter = useCallback(
    (nodeId: string) => {
      if (!taxonomyData) return;

      const clickedNode = graphState.nodes.find((n) => n.id === nodeId);
      if (!clickedNode || clickedNode.distance === 0) {
        return;
      }

      const newGraph = buildGraph(nodeId, clickedNode.type, taxonomyData, centralityData);

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
    [graphState, taxonomyData, centralityData]
  );

  /**
   * Go back to previous node in history
   */
  const goBack = useCallback(() => {
    if (!taxonomyData || graphState.history.length <= 1) return;

    const newHistory = graphState.history.slice(0, -1);
    const previousEntry = newHistory[newHistory.length - 1];

    if (!previousEntry) return;

    const newGraph = buildGraph(previousEntry.id, previousEntry.type, taxonomyData, centralityData);
    newGraph.history = newHistory;
    setGraphState(newGraph);
  }, [graphState.history, taxonomyData, centralityData]);

  const canGoBack = graphState.history.length > 1;

  return {
    graphState,
    recenter,
    goBack,
    canGoBack,
    isLoading,
  };
}
