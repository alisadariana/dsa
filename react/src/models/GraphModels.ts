// models/GraphModels.ts

export interface Node {
  id: string;
  label: string;
  // Additional properties like position can be added later for visualization
}

export interface Edge {
  id: string;
  source: string; // Source node id
  target: string; // Target node id
  weight?: number; // Optional weight for weighted graphs
  directed: boolean; // Whether the edge is directed
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  directed: boolean;
  weighted: boolean;
}

// Graph class to manage operations on the graph data
export class Graph {
  private nodes: Map<string, Node>;
  private edges: Map<string, Edge>;
  private adjacencyList: Map<string, Set<string>>;
  public directed: boolean;
  public weighted: boolean;

  constructor(directed: boolean = false, weighted: boolean = false) {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
    this.directed = directed;
    this.weighted = weighted;
  }

  // Node operations
  addNode(id: string, label: string = id): Node {
    if (this.nodes.has(id)) {
      throw new Error(`Node with id ${id} already exists`);
    }

    const node: Node = { id, label };
    this.nodes.set(id, node);
    this.adjacencyList.set(id, new Set());
    return node;
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  removeNode(id: string): boolean {
    if (!this.nodes.has(id)) {
      return false;
    }

    // Remove all edges connected to this node
    Array.from(this.edges.entries()).forEach(([edgeId, edge]) => {
      if (edge.source === id || edge.target === id) {
        this.edges.delete(edgeId);
      }
    });

    // Remove node from adjacency list and from other nodes' adjacency lists
    this.adjacencyList.delete(id);
    this.adjacencyList.forEach((adjacentNodes) => {
      adjacentNodes.delete(id);
    });

    // Remove the node
    this.nodes.delete(id);
    return true;
  }

  // Edge operations
  addEdge(sourceId: string, targetId: string, weight?: number): Edge {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      throw new Error("Source or target node does not exist");
    }

    const edgeId = `${sourceId}-${targetId}`;
    if (this.edges.has(edgeId)) {
      throw new Error(`Edge from ${sourceId} to ${targetId} already exists`);
    }

    const edge: Edge = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      directed: this.directed,
      weight: this.weighted ? weight : undefined,
    };

    this.edges.set(edgeId, edge);
    this.adjacencyList.get(sourceId)?.add(targetId);

    // If undirected, add the reverse connection
    if (!this.directed) {
      this.adjacencyList.get(targetId)?.add(sourceId);
    }

    return edge;
  }

  getEdge(sourceId: string, targetId: string): Edge | undefined {
    const edgeId = `${sourceId}-${targetId}`;
    return this.edges.get(edgeId);
  }

  removeEdge(sourceId: string, targetId: string): boolean {
    const edgeId = `${sourceId}-${targetId}`;
    if (!this.edges.has(edgeId)) {
      return false;
    }

    this.edges.delete(edgeId);
    this.adjacencyList.get(sourceId)?.delete(targetId);

    // If undirected, remove the reverse connection
    if (!this.directed) {
      this.adjacencyList.get(targetId)?.delete(sourceId);
    }

    return true;
  }

  // Graph data export
  getGraphData(): GraphData {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      directed: this.directed,
      weighted: this.weighted,
    };
  }

  // Adjacency matrix representation
  getAdjacencyMatrix(): number[][] {
    const nodeIds = Array.from(this.nodes.keys());
    const matrix: number[][] = [];

    // Initialize matrix with zeros
    for (let i = 0; i < nodeIds.length; i++) {
      matrix[i] = Array(nodeIds.length).fill(0);
    }

    // Fill matrix based on edges
    Array.from(this.edges.values()).forEach((edge) => {
      const sourceIndex = nodeIds.indexOf(edge.source);
      const targetIndex = nodeIds.indexOf(edge.target);

      // Check if indices are valid before accessing the matrix
      if (sourceIndex !== -1 && targetIndex !== -1) {
        if (this.weighted && edge.weight !== undefined) {
          matrix[sourceIndex][targetIndex] = edge.weight;
          if (!this.directed) {
            matrix[targetIndex][sourceIndex] = edge.weight;
          }
        } else {
          matrix[sourceIndex][targetIndex] = 1;
          if (!this.directed) {
            matrix[targetIndex][sourceIndex] = 1;
          }
        }
      } else {
        console.warn(
          `Edge ${edge.id} refers to non-existent node(s): ${edge.source} -> ${edge.target}`
        );
      }
    });

    return matrix;
  }

  // Adjacency list representation (as array of arrays for display purposes)
  getAdjacencyList(): { nodeId: string; adjacentNodes: string[] }[] {
    const result: { nodeId: string; adjacentNodes: string[] }[] = [];

    // Convert to array before iterating
    Array.from(this.adjacencyList.entries()).forEach(
      ([nodeId, adjacentNodes]) => {
        result.push({
          nodeId,
          adjacentNodes: Array.from(adjacentNodes),
        });
      }
    );

    return result;
  }

  // Graph traversal algorithms will be added in subsequent steps
}
