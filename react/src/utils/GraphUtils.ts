// utils/GraphUtils.ts
import { Graph } from "../models/GraphModels";

// Create a sample graph for testing and demonstration
export const createSampleGraph = (
  directed: boolean = false,
  weighted: boolean = false
): Graph => {
  const graph = new Graph(directed, weighted);

  try {
    // Add nodes
    graph.addNode("1", "Node 1");
    graph.addNode("2", "Node 2");
    graph.addNode("3", "Node 3");
    graph.addNode("4", "Node 4");
    graph.addNode("5", "Node 5");

    // Add edges
    if (weighted) {
      graph.addEdge("1", "2", 10);
      graph.addEdge("1", "3", 5);
      graph.addEdge("2", "3", 2);
      graph.addEdge("2", "4", 1);
      graph.addEdge("3", "5", 7);
      graph.addEdge("4", "5", 4);
    } else {
      graph.addEdge("1", "2");
      graph.addEdge("1", "3");
      graph.addEdge("2", "3");
      graph.addEdge("2", "4");
      graph.addEdge("3", "5");
      graph.addEdge("4", "5");
    }
  } catch (error) {
    console.error("Error creating sample graph:", error);
  }

  return graph;
};

// Create an empty graph
export const createEmptyGraph = (
  directed: boolean = false,
  weighted: boolean = false
): Graph => {
  return new Graph(directed, weighted);
};

// Format the adjacency matrix for display
export const formatAdjacencyMatrix = (
  matrix: number[][],
  nodeIds: string[]
): string => {
  if (matrix.length === 0 || nodeIds.length === 0) {
    return "No data available";
  }

  let result = "  " + nodeIds.join(" ") + "\n";

  for (let i = 0; i < matrix.length; i++) {
    result += nodeIds[i] + " " + matrix[i].join(" ") + "\n";
  }

  return result;
};

// Format the adjacency list for display
export const formatAdjacencyList = (
  adjList: { nodeId: string; adjacentNodes: string[] }[]
): string => {
  let result = "";

  for (const item of adjList) {
    result += `${item.nodeId} -> ${item.adjacentNodes.join(", ") || "none"}\n`;
  }

  return result;
};
