import { Graph } from "./GraphModels";

export interface TraversalStep {
  visited: Set<string>;
  current: string | null;
  queue?: string[]; // For BFS
  stack?: string[]; // For DFS
  sourceNode?: string | null;
  targetNode?: string | null;
  description: string;
}

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
      sourceNode: null,
      targetNode: null,
      description: `Error: Start node ${startNodeId} not found in the graph.`,
    });
    return steps;
  }

  // Initialize
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  visited.add(startNodeId);

  steps.push({
    visited: new Set(visited),
    current: startNodeId,
    queue: [...queue],
    sourceNode: null,
    targetNode: null,
    description: `Initialize: Mark start node ${startNodeId} as visited and add to queue.`,
  });

  while (queue.length > 0) {
    const currentNode = queue.shift()!;

    steps.push({
      visited: new Set(visited),
      current: currentNode,
      queue: [...queue],
      sourceNode: null,
      targetNode: null,
      description: `Process: Dequeue and examine node ${currentNode}.`,
    });

    try {
      // Get adjacent nodes
      const adjList = graph.getAdjacencyList();
      const adjacentNodes =
        adjList.find((item) => item.nodeId === currentNode)?.adjacentNodes ||
        [];

      // If no adjacent nodes, add a observation step
      if (adjacentNodes.length === 0) {
        steps.push({
          visited: new Set(visited),
          current: currentNode,
          queue: [...queue],
          sourceNode: null,
          targetNode: null,
          description: `Observe: Node ${currentNode} has no unvisited neighbors.`,
        });
      }

      for (const neighborId of adjacentNodes) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);

          steps.push({
            visited: new Set(visited),
            current: currentNode,
            queue: [...queue],
            sourceNode: currentNode,
            targetNode: neighborId,
            description: `Discover: Mark node ${neighborId} as visited and enqueue. Edge (${currentNode} → ${neighborId}).`,
          });
        } else {
          steps.push({
            visited: new Set(visited),
            current: currentNode,
            queue: [...queue],
            sourceNode: currentNode,
            targetNode: neighborId,
            description: `Skip: Node ${neighborId} already visited. Edge (${currentNode} → ${neighborId}).`,
          });
        }
      }
    } catch (error) {
      console.error(`Error processing node ${currentNode} in BFS:`, error);
      steps.push({
        visited: new Set(visited),
        current: currentNode,
        queue: [...queue],
        sourceNode: null,
        targetNode: null,
        description: `Error: Failed to process node ${currentNode}.`,
      });
    }
  }

  steps.push({
    visited: new Set(visited),
    current: null,
    queue: [],
    sourceNode: null,
    targetNode: null,
    description: "Complete: BFS traversal finished.",
  });

  return steps;
};

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
      sourceNode: null,
      targetNode: null,
      description: `Error: Start node ${startNodeId} not found in the graph.`,
    });
    return steps;
  }

  // Initialize
  const visited = new Set<string>();
  const stack: string[] = [startNodeId];
  visited.add(startNodeId); // Mark start node as visited immediately

  steps.push({
    visited: new Set(visited),
    current: startNodeId,
    stack: [...stack],
    sourceNode: null,
    targetNode: null,
    description: `Initialize: Mark start node ${startNodeId} as visited and push to stack.`,
  });

  while (stack.length > 0) {
    const currentNode = stack[stack.length - 1]; // Peek at top of stack
    const adjList = graph.getAdjacencyList();
    const adjacentNodes =
      adjList.find((item) => item.nodeId === currentNode)?.adjacentNodes || [];

    // Find the next unvisited adjacent node
    let nextNode = null;
    for (const neighborId of adjacentNodes) {
      if (!visited.has(neighborId)) {
        nextNode = neighborId;
        break;
      }
    }

    if (nextNode) {
      // Process the next unvisited node
      visited.add(nextNode);
      stack.push(nextNode);

      steps.push({
        visited: new Set(visited),
        current: nextNode,
        stack: [...stack],
        sourceNode: currentNode,
        targetNode: nextNode,
        description: `Expand: Found unvisited node ${nextNode}. Mark as visited and push to stack. Edge (${currentNode} → ${nextNode}).`,
      });
    } else {
      // No unvisited neighbors, backtrack
      const backtrackNode = stack.pop();

      // Skip pushing a step if we're at the end
      if (stack.length > 0) {
        const returnNode = stack[stack.length - 1];
        steps.push({
          visited: new Set(visited),
          current: returnNode,
          stack: [...stack],
          sourceNode: returnNode,
          targetNode: backtrackNode,
          description: `Backtrack: No unvisited neighbors for ${backtrackNode}. Return to node ${returnNode}.`,
        });
      } else {
        steps.push({
          visited: new Set(visited),
          current: null,
          stack: [...stack],
          sourceNode: null,
          targetNode: null,
          description: `Backtrack: No unvisited neighbors for ${backtrackNode}. Stack now empty.`,
        });
      }
    }
  }

  steps.push({
    visited: new Set(visited),
    current: null,
    stack: [],
    sourceNode: null,
    targetNode: null,
    description: "Complete: DFS traversal finished.",
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
  sourceId: string
): DijkstraStep[] => {
  const steps: DijkstraStep[] = [];
  const graphData = graph.getGraphData();

  // Check if source node exists
  if (!graphData.nodes.find((node) => node.id === sourceId)) {
    steps.push({
      visited: new Set(),
      current: null,
      distances: new Map(),
      previous: new Map(),
      description: `Source node ${sourceId} not found in graph.`,
    });
    return steps;
  }

  // Initialize data structures
  const n = graphData.nodes.length;
  const S = new Set<string>(); // Selected vertices
  const dist = new Map<string, number>();
  const parent = new Map<string, string | null>();

  // Initialize dist and parent
  for (const node of graphData.nodes) {
    const edge = graph.getEdge(sourceId, node.id);
    const cost =
      edge && edge.weight !== undefined
        ? edge.weight
        : node.id === sourceId
        ? 0
        : Infinity;

    dist.set(node.id, cost);
    parent.set(node.id, cost < Infinity ? sourceId : null);
  }

  // Set source values
  S.add(sourceId);
  dist.set(sourceId, 0);
  parent.set(sourceId, null);

  steps.push({
    visited: new Set(S),
    current: sourceId,
    distances: new Map(dist),
    previous: new Map(parent),
    description: `Initialize: Set source ${sourceId} distance to 0, add to S.`,
  });

  // Main algorithm loop
  for (let step = 0; step < n - 1; step++) {
    // Find unselected vertex with minimum distance
    let minDist = Infinity;
    let minVertex: string | null = null;

    for (const node of graphData.nodes) {
      if (!S.has(node.id)) {
        const distance = dist.get(node.id) || Infinity;
        if (distance < minDist) {
          minDist = distance;
          minVertex = node.id;
        }
      }
    }

    // If no reachable vertices remain, stop
    if (minVertex === null || minDist === Infinity) {
      steps.push({
        visited: new Set(S),
        current: null,
        distances: new Map(dist),
        previous: new Map(parent),
        description: "No more reachable vertices found.",
      });
      break;
    }

    // Add minVertex to S
    S.add(minVertex);

    steps.push({
      visited: new Set(S),
      current: minVertex,
      distances: new Map(dist),
      previous: new Map(parent),
      description: `Select: Add vertex ${minVertex} with distance ${minDist} to S.`,
    });

    // Update distances through minVertex
    for (const node of graphData.nodes) {
      if (!S.has(node.id)) {
        const edge = graph.getEdge(minVertex, node.id);
        const edgeCost =
          edge && edge.weight !== undefined ? edge.weight : Infinity;

        if (edgeCost < Infinity) {
          const newDist = (dist.get(minVertex) || 0) + edgeCost;
          const oldDist = dist.get(node.id) || Infinity;

          if (newDist < oldDist) {
            dist.set(node.id, newDist);
            parent.set(node.id, minVertex);

            steps.push({
              visited: new Set(S),
              current: minVertex,
              distances: new Map(dist),
              previous: new Map(parent),
              description: `Update: Distance to ${node.id} via ${minVertex} from ${oldDist} to ${newDist}.`,
            });
          }
        }
      }
    }
  }

  // Add final step
  steps.push({
    visited: new Set(S),
    current: null,
    distances: new Map(dist),
    previous: new Map(parent),
    description: "Complete: Dijkstra's algorithm finished.",
  });

  return steps;
};
