// models/GraphAlgorithms.ts
import { Graph } from "./GraphModels";

// Represent the state of a traversal for visualization
export interface TraversalStep {
  visited: Set<string>;
  current: string | null;
  queue?: string[]; // For BFS
  stack?: string[]; // For DFS
  description: string;
}

// BFS traversal with step-by-step tracking
export const breadthFirstTraversal = (
  graph: Graph,
  startNodeId: string
): TraversalStep[] => {
  const steps: TraversalStep[] = [];
  const graphData = graph.getGraphData();

  // Check if start node exists
  if (!graphData.nodes.find((node) => node.id === startNodeId)) {
    steps.push({
      visited: new Set(),
      current: null,
      queue: [],
      description: `Start node ${startNodeId} not found in the graph.`,
    });
    return steps;
  }

  // Initialize
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  visited.add(startNodeId);

  steps.push({
    visited: new Set(visited),
    current: null,
    queue: [...queue],
    description: `Initialize BFS with start node ${startNodeId}`,
  });

  while (queue.length > 0) {
    const currentNode = queue.shift()!;

    steps.push({
      visited: new Set(visited),
      current: currentNode,
      queue: [...queue],
      description: `Dequeue node ${currentNode}`,
    });

    try {
      // Get adjacent nodes
      const adjList = graph.getAdjacencyList();
      const adjacentNodes =
        adjList.find((item) => item.nodeId === currentNode)?.adjacentNodes ||
        [];

      for (const neighborId of adjacentNodes) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);

          steps.push({
            visited: new Set(visited),
            current: currentNode,
            queue: [...queue],
            description: `Visit node ${neighborId} from ${currentNode}`,
          });
        }
      }
    } catch (error) {
      console.error(`Error processing node ${currentNode} in BFS:`, error);
      steps.push({
        visited: new Set(visited),
        current: currentNode,
        queue: [...queue],
        description: `Error processing node ${currentNode}`,
      });
    }
  }

  steps.push({
    visited: new Set(visited),
    current: null,
    queue: [],
    description: "BFS traversal complete",
  });

  return steps;
};

// DFS traversal with step-by-step tracking
export const depthFirstTraversal = (
  graph: Graph,
  startNodeId: string
): TraversalStep[] => {
  const steps: TraversalStep[] = [];
  const graphData = graph.getGraphData();

  // Check if start node exists
  if (!graphData.nodes.find((node) => node.id === startNodeId)) {
    steps.push({
      visited: new Set(),
      current: null,
      stack: [],
      description: `Start node ${startNodeId} not found in the graph.`,
    });
    return steps;
  }

  // Initialize
  const visited = new Set<string>();
  const stack: string[] = [startNodeId];

  steps.push({
    visited: new Set(),
    current: null,
    stack: [...stack],
    description: `Initialize DFS with start node ${startNodeId}`,
  });

  while (stack.length > 0) {
    const currentNode = stack.pop()!;

    if (!visited.has(currentNode)) {
      visited.add(currentNode);

      steps.push({
        visited: new Set(visited),
        current: currentNode,
        stack: [...stack],
        description: `Visit node ${currentNode}`,
      });

      try {
        // Get adjacent nodes
        const adjList = graph.getAdjacencyList();
        const adjacentNodes =
          adjList.find((item) => item.nodeId === currentNode)?.adjacentNodes ||
          [];

        // Process neighbors in reverse order (to maintain expected DFS order)
        const neighbors = [...adjacentNodes].reverse();

        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            stack.push(neighborId);

            steps.push({
              visited: new Set(visited),
              current: currentNode,
              stack: [...stack],
              description: `Push node ${neighborId} to stack`,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing node ${currentNode} in DFS:`, error);
        steps.push({
          visited: new Set(visited),
          current: currentNode,
          stack: [...stack],
          description: `Error processing node ${currentNode}`,
        });
      }
    }
  }

  steps.push({
    visited: new Set(visited),
    current: null,
    stack: [],
    description: "DFS traversal complete",
  });

  return steps;
};

// Dijkstra's algorithm with step-by-step tracking
export interface DijkstraStep {
  visited: Set<string>;
  current: string | null;
  distances: Map<string, number>;
  previous: Map<string, string | null>;
  description: string;
}

export const dijkstraAlgorithm = (
  graph: Graph,
  startNodeId: string
): DijkstraStep[] => {
  const steps: DijkstraStep[] = [];
  const graphData = graph.getGraphData();

  // Check if start node exists
  if (!graphData.nodes.find((node) => node.id === startNodeId)) {
    steps.push({
      visited: new Set(),
      current: null,
      distances: new Map(),
      previous: new Map(),
      description: `Start node ${startNodeId} not found in the graph.`,
    });
    return steps;
  }

  // Initialize
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();

  // Set initial distances
  for (const node of graphData.nodes) {
    distances.set(node.id, node.id === startNodeId ? 0 : Infinity);
    previous.set(node.id, null);
  }

  steps.push({
    visited: new Set(),
    current: null,
    distances: new Map(distances),
    previous: new Map(previous),
    description: `Initialize Dijkstra's algorithm with start node ${startNodeId}`,
  });

  while (visited.size < graphData.nodes.length) {
    // Find the node with the minimum distance
    let minDistance = Infinity;
    let current: string | null = null;

    for (const node of graphData.nodes) {
      if (
        !visited.has(node.id) &&
        (distances.get(node.id) || Infinity) < minDistance
      ) {
        minDistance = distances.get(node.id) || Infinity;
        current = node.id;
      }
    }

    // If we found no reachable nodes, we're done
    if (current === null || minDistance === Infinity) {
      steps.push({
        visited: new Set(visited),
        current: null,
        distances: new Map(distances),
        previous: new Map(previous),
        description: "No more reachable nodes",
      });
      break;
    }

    // Mark current as visited
    visited.add(current);

    steps.push({
      visited: new Set(visited),
      current: current,
      distances: new Map(distances),
      previous: new Map(previous),
      description: `Visit node ${current} with distance ${distances.get(
        current
      )}`,
    });

    try {
      // Update distances to neighbors
      const adjList = graph.getAdjacencyList();
      const neighbors =
        adjList.find((item) => item.nodeId === current)?.adjacentNodes || [];

      for (const neighborId of neighbors) {
        if (visited.has(neighborId)) continue;

        // Calculate new distance
        const edge = graph.getEdge(current, neighborId);
        const weight = edge && edge.weight !== undefined ? edge.weight : 1;
        const newDistance = (distances.get(current) || 0) + weight;

        // If we found a better path
        if (newDistance < (distances.get(neighborId) || Infinity)) {
          distances.set(neighborId, newDistance);
          previous.set(neighborId, current);

          steps.push({
            visited: new Set(visited),
            current: current,
            distances: new Map(distances),
            previous: new Map(previous),
            description: `Update distance to ${neighborId} via ${current} to ${newDistance}`,
          });
        }
      }
    } catch (error) {
      console.error(
        `Error processing node ${current} in Dijkstra's algorithm:`,
        error
      );
      steps.push({
        visited: new Set(visited),
        current: current,
        distances: new Map(distances),
        previous: new Map(previous),
        description: `Error processing node ${current}`,
      });
    }
  }

  steps.push({
    visited: new Set(visited),
    current: null,
    distances: new Map(distances),
    previous: new Map(previous),
    description: `Dijkstra's algorithm complete`,
  });

  return steps;
};
