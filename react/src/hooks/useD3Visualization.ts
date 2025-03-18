// src/hooks/useD3Visualization.tsx
import { useEffect } from "react";
import * as d3 from "d3";
import { Node, Edge, GraphData } from "../models/GraphModels";
import { useGraph } from "../context/GraphContext";

export function useD3Visualization(width: number, height: number) {
  const { graphData, svgRef, simulation, initializeSimulation } = useGraph();

  // Store graph properties to detect changes
  const isDirected = graphData.directed;
  const isWeighted = graphData.weighted;

  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;

    // Store ref value for cleanup function to avoid stale refs
    const currentSvgRef = svgRef.current;

    // Clear previous SVG content
    d3.select(currentSvgRef).selectAll("*").remove();

    // Create SVG
    const svg = d3
      .select(currentSvgRef)
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

    // Get or create simulation
    const currentSimulation = simulation || initializeSimulation(width, height);
    if (!currentSimulation) return;

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
      .attr("id", (d: Node) => `node-${d.id}`)
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
      svg
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
    if (currentSimulation) {
      currentSimulation.on("tick", () => {
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
    }

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active && currentSimulation)
        currentSimulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active && currentSimulation) currentSimulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Restart simulation if needed
    if (currentSimulation) {
      currentSimulation.alpha(0.3).restart();
    }

    return () => {
      // Don't stop the simulation here, just disconnect event handlers
      // The simulation will be managed by the context
      d3.select(currentSvgRef).selectAll("circle").on(".drag", null);
    };
  }, [
    graphData,
    isDirected,
    isWeighted,
    width,
    height,
    svgRef,
    simulation,
    initializeSimulation,
  ]);

  // Return a function to highlight nodes for algorithm visualization
  const updateNodeColors = (
    visitedNodes: string[] = [],
    currentNode: string | null = null
  ) => {
    if (!svgRef.current) return;

    // Capture current ref to avoid stale refs
    const currentSvgRef = svgRef.current;

    // Reset node colors
    d3.select(currentSvgRef).selectAll("circle").attr("fill", "#69b3a2");

    // Update visited nodes
    visitedNodes.forEach((nodeId) => {
      d3.select(currentSvgRef)
        .select(`#node-${nodeId}`)
        .attr("fill", "#3498db"); // Visited nodes in blue
    });

    // Update current node
    if (currentNode) {
      d3.select(currentSvgRef)
        .select(`#node-${currentNode}`)
        .attr("fill", "#e74c3c"); // Current node in red
    }
  };

  const highlightEdge = (
    sourceNodeId: string | null = null,
    targetNodeId: string | null = null
  ) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Reset all edges to default style
    svg
      .selectAll("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    // Highlight the specific edge if both source and target are provided
    if (sourceNodeId && targetNodeId) {
      svg
        .selectAll("line")
        .filter(function (d: any) {
          const source = typeof d.source === "object" ? d.source.id : d.source;
          const target = typeof d.target === "object" ? d.target.id : d.target;
          return (
            (source === sourceNodeId && target === targetNodeId) ||
            (!graphData.directed &&
              source === targetNodeId &&
              target === sourceNodeId)
          );
        })
        .attr("stroke", "#e74c3c") // Highlight color
        .attr("stroke-width", 4)
        .attr("stroke-opacity", 1);
    }
  };

  return { updateNodeColors, highlightEdge };
}
