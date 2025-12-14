import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge } from './networkTypes';

export interface UseNetworkSimulationOptions {
  width: number;
  height: number;
  centerNodeId: string;
  onTick?: () => void;
  onEnd?: () => void;
}

export interface UseNetworkSimulationResult {
  /** Reheat the simulation (restart with alpha) */
  reheat: () => void;
  /** Stop the simulation */
  stop: () => void;
  /** Check if simulation is running */
  isRunning: boolean;
}

/**
 * Get the collision radius of a node
 * Now accounts for label text below the dot
 */
function getNodeCollisionRadius(node: GraphNode): number {
  // Base collision radius includes space for label below dot
  // Center node: larger label, code, and badge
  // Distance 1: medium label and badge
  // Distance 2: small label and badge
  if (node.distance === 0) return 70;
  if (node.distance === 1) return 55;
  return 40;
}

/**
 * Hook that creates and manages a D3 force simulation
 * Runs simulation to completion INSTANTLY (no animation) for better performance
 */
export function useNetworkSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: UseNetworkSimulationOptions
): UseNetworkSimulationResult {
  const { width, height, centerNodeId, onEnd } = options;

  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(
    null
  );
  const [isRunning, setIsRunning] = useState(false);

  // Create/update simulation when inputs change
  useEffect(() => {
    // Don't create simulation with invalid dimensions
    if (width <= 0 || height <= 0 || nodes.length === 0) {
      return;
    }

    // Stop existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Find center node and fix its position
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize node positions if not set
    for (const node of nodes) {
      if (node.x === undefined || node.y === undefined) {
        if (node.id === centerNodeId) {
          // Center node at center
          node.x = centerX;
          node.y = centerY;
          node.fx = centerX;
          node.fy = centerY;
        } else {
          // Other nodes start near center with some randomness
          const angle = Math.random() * 2 * Math.PI;
          const radius = 50 + Math.random() * 100;
          node.x = centerX + Math.cos(angle) * radius;
          node.y = centerY + Math.sin(angle) * radius;
          node.fx = null;
          node.fy = null;
        }
      } else if (node.id === centerNodeId) {
        // Ensure center node is fixed at center
        node.fx = centerX;
        node.fy = centerY;
      } else {
        // Release other nodes so they can move
        node.fx = null;
        node.fy = null;
      }
    }

    // Create the simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      // Link force - pulls connected nodes together
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance((d) => {
            // Shorter distance for essential relations
            const base = 140;
            return d.relationType === 'essential' ? base : base * 1.2;
          })
          .strength((d) => (d.relationType === 'essential' ? 0.7 : 0.4))
      )
      // Repulsion between all nodes
      .force(
        'charge',
        d3.forceManyBody<GraphNode>().strength((d) => {
          // Stronger repulsion for center node
          if (d.id === centerNodeId) return -500;
          if (d.distance === 1) return -250;
          return -150;
        })
      )
      // Collision detection to prevent overlap (larger radius for labels)
      .force(
        'collision',
        d3.forceCollide<GraphNode>().radius((d) => getNodeCollisionRadius(d))
      )
      // Radial force to push distance-2 nodes outward
      .force(
        'radial',
        d3
          .forceRadial<GraphNode>(
            (d) => {
              if (d.distance === 0) return 0;
              if (d.distance === 1) return Math.min(width, height) * 0.2;
              return Math.min(width, height) * 0.35;
            },
            centerX,
            centerY
          )
          .strength((d) => {
            if (d.distance === 0) return 0;
            if (d.distance === 2) return 0.3;
            return 0.1;
          })
      )
      // Keep nodes within bounds
      .force('bounds', () => {
        const padding = 50;
        for (const node of nodes) {
          if (node.fx !== null || node.fy !== null) continue; // Skip fixed nodes
          if (node.x !== undefined) {
            node.x = Math.max(padding, Math.min(width - padding, node.x));
          }
          if (node.y !== undefined) {
            node.y = Math.max(padding, Math.min(height - padding, node.y));
          }
        }
      });

    // RUN SIMULATION TO COMPLETION INSTANTLY (no animation)
    // This calculates all final positions synchronously
    setIsRunning(true);
    simulation.stop(); // Prevent automatic ticking

    // Run simulation iterations manually until it cools down
    const iterations = 300; // Enough iterations for convergence
    for (let i = 0; i < iterations; i++) {
      simulation.tick();
    }

    setIsRunning(false);
    onEnd?.();

    simulationRef.current = simulation;

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, edges, width, height, centerNodeId, onEnd]);

  /**
   * Reheat the simulation (runs instantly)
   */
  const reheat = useCallback(() => {
    if (simulationRef.current) {
      setIsRunning(true);
      simulationRef.current.alpha(0.5);
      // Run to completion instantly
      for (let i = 0; i < 150; i++) {
        simulationRef.current.tick();
      }
      setIsRunning(false);
    }
  }, []);

  /**
   * Stop the simulation
   */
  const stop = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.stop();
      setIsRunning(false);
    }
  }, []);

  return { reheat, stop, isRunning };
}
