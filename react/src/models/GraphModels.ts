export interface Node {
  id: string;
  label: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  directed: boolean;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  directed: boolean;
  weighted: boolean;
}

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

    Array.from(this.edges.entries()).forEach(([edgeId, edge]) => {
      if (edge.source === id || edge.target === id) {
        this.edges.delete(edgeId);
      }
    });

    this.adjacencyList.delete(id);
    this.adjacencyList.forEach((adjacentNodes) => {
      adjacentNodes.delete(id);
    });

    this.nodes.delete(id);
    return true;
  }

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

    if (!this.directed) {
      this.adjacencyList.get(targetId)?.delete(sourceId);
    }

    return true;
  }

  getGraphData(): GraphData {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      directed: this.directed,
      weighted: this.weighted,
    };
  }

  getAdjacencyMatrix(): number[][] {
    const nodeIds = Array.from(this.nodes.keys());
    const matrix: number[][] = [];

    for (let i = 0; i < nodeIds.length; i++) {
      matrix[i] = Array(nodeIds.length).fill(0);
    }

    Array.from(this.edges.values()).forEach((edge) => {
      const sourceId =
        typeof edge.source === "object" ? (edge.source as any).id : edge.source;
      const targetId =
        typeof edge.target === "object" ? (edge.target as any).id : edge.target;

      const sourceIndex = nodeIds.indexOf(sourceId);
      const targetIndex = nodeIds.indexOf(targetId);

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
          `Edge ${edge.id} refers to non-existent node(s): ${sourceId} -> ${targetId}`
        );
      }
    });

    return matrix;
  }

  getAdjacencyList(): { nodeId: string; adjacentNodes: string[] }[] {
    const result: { nodeId: string; adjacentNodes: string[] }[] = [];

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
}
