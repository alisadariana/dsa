import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import * as d3 from "d3";
import { Graph, Node, Edge, GraphData } from "./models/GraphModels";
import {
  createSampleGraph,
  formatAdjacencyMatrix,
  formatAdjacencyList,
} from "./utils/GraphUtils";
import GraphTraversal from "./components/GraphTraversal";

const GraphVisualization: React.FC = () => {
  // State for the graph data
  const [graph, setGraph] = useState<Graph>(() =>
    createSampleGraph(false, false)
  );
  const [graphData, setGraphData] = useState<GraphData>(() =>
    graph.getGraphData()
  );

  // Refs for D3 visualization
  const svgRef = useRef<SVGSVGElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // State for graph representations
  const [adjacencyMatrix, setAdjacencyMatrix] = useState<string>("");
  const [adjacencyList, setAdjacencyList] = useState<string>("");

  // State for UI
  const [showGraphTheory, setShowGraphTheory] = useState<boolean>(false);

  // Update representations when graph changes
  useEffect(() => {
    try {
      const data = graph.getGraphData();
      setGraphData(data);

      const matrix = graph.getAdjacencyMatrix();
      const nodeIds = data.nodes.map((node) => node.id);
      setAdjacencyMatrix(formatAdjacencyMatrix(matrix, nodeIds));

      const adjList = graph.getAdjacencyList();
      setAdjacencyList(formatAdjacencyList(adjList));
    } catch (error) {
      console.error("Error updating graph representations:", error);
    }
  }, [graph]);

  // D3 visualization effect
  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;

    const width = 600;
    const height = 400;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Define arrow markers for directed graphs
    if (graphData.directed) {
      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#999");
    }

    // Create force simulation
    const simulation = d3
      .forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(graphData.edges)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw edges
    const links = svg
      .append("g")
      .selectAll("line")
      .data(graphData.edges)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("marker-end", graphData.directed ? "url(#arrowhead)" : "");

    // Draw nodes
    const nodes = svg
      .append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", "#69b3a2")
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as any
      );

    // Add node labels
    const labels = svg
      .append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .enter()
      .append("text")
      .text((d: Node) => d.label)
      .attr("font-size", 12)
      .attr("dx", -5)
      .attr("dy", 5)
      .attr("fill", "white");

    // Add edge weight labels if weighted
    if (graphData.weighted) {
      const edgeLabels = svg
        .append("g")
        .selectAll("text")
        .data(graphData.edges)
        .enter()
        .append("text")
        .attr("font-size", 10)
        .attr("fill", "black")
        .text((d: Edge) => d.weight?.toString() || "");
    }

    // Update positions on each simulation tick
    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      labels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);

      if (graphData.weighted) {
        svg
          .selectAll("text")
          .filter((d: any) => d.source && d.target)
          .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
          .attr("y", (d: any) => (d.source.y + d.target.y) / 2);
      }
    });

    // Drag functions for interactive nodes
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [graphData]);

  // Toggle between directed and undirected graphs
  const toggleDirected = () => {
    const newGraph = createSampleGraph(!graph.directed, graph.weighted);
    setGraph(newGraph);
  };

  // Toggle between weighted and unweighted graphs
  const toggleWeighted = () => {
    const newGraph = createSampleGraph(graph.directed, !graph.weighted);
    setGraph(newGraph);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Graph Algorithms Visualization
      </h1>

      <div className="mb-4">
        <button
          onClick={() => setShowGraphTheory(!showGraphTheory)}
          className="p-2 bg-gray-300 text-gray-700 mb-4"
        >
          {showGraphTheory ? "Hide" : "Show"} Graph Theory Introduction
        </button>

        {showGraphTheory && (
          <div className="p-4 bg-gray-100 mb-4">
            <h2 className="text-xl font-bold mb-2">
              Introduction to Graph Theory
            </h2>
            <p className="mb-2">
              A graph is a set of vertices (nodes) and edges connecting these
              vertices.
            </p>
            <ul className="list-disc pl-6 mb-2">
              <li>
                <strong>Directed Graph:</strong> Edges have a direction from one
                vertex to another.
              </li>
              <li>
                <strong>Undirected Graph:</strong> Edges have no direction.
              </li>
              <li>
                <strong>Weighted Graph:</strong> Edges have weights or costs
                associated with them.
              </li>
            </ul>

            <h3 className="text-lg font-bold mt-4 mb-2">
              Graph Representations
            </h3>
            <p className="mb-2">
              There are mainly two ways to represent a graph:
            </p>
            <ul className="list-disc pl-6 mb-2">
              <li>
                <strong>Adjacency Matrix:</strong> A 2D array where matrix[i][j]
                = 1 if there is an edge from i to j, and 0 otherwise.
              </li>
              <li>
                <strong>Adjacency List:</strong> An array of lists where each
                list contains the neighbors of a vertex.
              </li>
            </ul>

            <h3 className="text-lg font-bold mt-4 mb-2">
              Graph Traversal Algorithms
            </h3>
            <p className="mb-2">
              Common ways to visit all vertices in a graph:
            </p>
            <ul className="list-disc pl-6 mb-2">
              <li>
                <strong>Breadth-First Search (BFS):</strong> Explores all the
                neighbors of a vertex before moving to the next level. Uses a
                queue.
              </li>
              <li>
                <strong>Depth-First Search (DFS):</strong> Explores as far as
                possible along a branch before backtracking. Uses a stack.
              </li>
            </ul>

            <h3 className="text-lg font-bold mt-4 mb-2">
              Path Finding Algorithms
            </h3>
            <ul className="list-disc pl-6">
              <li>
                <strong>Dijkstra's Algorithm:</strong> Finds the shortest path
                from a source vertex to all other vertices in a weighted graph.
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex mb-4">
        <button
          onClick={toggleDirected}
          className={`p-2 mr-2 ${
            graph.directed ? "bg-red-500" : "bg-gray-300"
          } text-white`}
        >
          {graph.directed ? "Directed" : "Undirected"}
        </button>

        <button
          onClick={toggleWeighted}
          className={`p-2 ${
            graph.weighted ? "bg-red-500" : "bg-gray-300"
          } text-white`}
        >
          {graph.weighted ? "Weighted" : "Unweighted"}
        </button>
      </div>

      <div className="flex mb-6">
        {/* Graph Visualization */}
        <div className="p-4 border mr-4 w-one-third">
          <h2 className="text-xl font-bold mb-2">Graph Visualization</h2>
          <div ref={graphContainerRef} className="h-64 overflow-auto">
            <svg ref={svgRef}></svg>
          </div>
        </div>

        {/* Adjacency Matrix */}
        <div className="p-4 border mr-4 w-one-third">
          <h2 className="text-xl font-bold mb-2">Adjacency Matrix</h2>
          <pre className="h-64 overflow-auto bg-gray-100 p-2">
            {adjacencyMatrix}
          </pre>
        </div>

        {/* Adjacency List */}
        <div className="p-4 border w-one-third">
          <h2 className="text-xl font-bold mb-2">Adjacency List</h2>
          <pre className="h-64 overflow-auto bg-gray-100 p-2">
            {adjacencyList}
          </pre>
        </div>
      </div>

      {/* Graph Traversal Visualization */}
      <GraphTraversal graph={graph} width={600} height={400} />

      <div className="mt-6">
        <Link to="/" className="p-2 bg-red-500 text-white">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default GraphVisualization;
