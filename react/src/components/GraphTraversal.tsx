// components/GraphTraversal.tsx
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Graph, Node, Edge, GraphData } from "../models/GraphModels";
import {
  TraversalStep,
  breadthFirstTraversal,
  depthFirstTraversal,
  DijkstraStep,
  dijkstraAlgorithm,
} from "../models/GraphAlgorithms";

interface GraphTraversalProps {
  graph: Graph;
  width?: number;
  height?: number;
}

const GraphTraversal: React.FC<GraphTraversalProps> = ({
  graph,
  width = 600,
  height = 400,
}) => {
  // Refs for D3 visualization
  const svgRef = useRef<SVGSVGElement>(null);

  // States for algorithm visualization
  const [algorithm, setAlgorithm] = useState<"bfs" | "dfs" | "dijkstra">("bfs");
  const [startNode, setStartNode] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [steps, setSteps] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<GraphData>(graph.getGraphData());

  // Animation timer
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update graph data when graph changes
  useEffect(() => {
    setGraphData(graph.getGraphData());

    // Set default start node if not set
    if (graphData.nodes.length > 0 && startNode === "") {
      setStartNode(graphData.nodes[0].id);
    }
  }, [graph, graphData.nodes, startNode]);

  // Initialize D3 visualization
  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;

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

    // Drag functions
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

    // Cleanup simulation on unmount
    return () => {
      simulation.stop();
    };
  }, [graphData, width, height]);

  // Update visualization based on current step
  useEffect(() => {
    if (!svgRef.current || steps.length === 0 || stepIndex >= steps.length)
      return;

    // Reset node colors
    d3.select(svgRef.current).selectAll("circle").attr("fill", "#69b3a2");

    const currentStep = steps[stepIndex];

    // Update node colors based on algorithm state
    currentStep.visited.forEach((nodeId: string) => {
      d3.select(svgRef.current)
        .select(`#node-${nodeId}`)
        .attr("fill", "#3498db"); // Visited nodes in blue
    });

    // Current node in red
    if (currentStep.current) {
      d3.select(svgRef.current)
        .select(`#node-${currentStep.current}`)
        .attr("fill", "#e74c3c");
    }
  }, [steps, stepIndex]);

  // Start algorithm visualization
  const runAlgorithm = () => {
    // Stop any running animation
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);
    setStepIndex(0);

    if (!startNode) return;

    let algorithmSteps: any[] = [];

    try {
      switch (algorithm) {
        case "bfs":
          algorithmSteps = breadthFirstTraversal(graph, startNode);
          break;
        case "dfs":
          algorithmSteps = depthFirstTraversal(graph, startNode);
          break;
        case "dijkstra":
          algorithmSteps = dijkstraAlgorithm(graph, startNode);
          break;
      }

      setSteps(algorithmSteps);
    } catch (error) {
      console.error("Error running algorithm:", error);
    }
  };

  // Play/pause animation
  const toggleAnimation = () => {
    if (isRunning) {
      // Pause
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRunning(false);
    } else {
      // Play
      if (steps.length === 0) {
        runAlgorithm();
      }

      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setStepIndex((prevIndex) => {
          if (prevIndex >= steps.length - 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setIsRunning(false);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, animationSpeed);
    }
  };

  // Step forward
  const stepForward = () => {
    if (steps.length === 0) {
      runAlgorithm();
      return;
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  // Step backward
  const stepBackward = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  // Reset visualization
  const resetVisualization = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);
    setStepIndex(0);

    // Reset node colors
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("circle").attr("fill", "#69b3a2");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 border">
      <h2 className="text-xl font-bold mb-4">Algorithm Visualization</h2>

      <div className="mb-4">
        <label className="mr-2">Algorithm:</label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as any)}
          className="p-2 border mr-4"
        >
          <option value="bfs">Breadth-First Search</option>
          <option value="dfs">Depth-First Search</option>
          <option value="dijkstra">Dijkstra's Algorithm</option>
        </select>

        <label className="mr-2">Start Node:</label>
        <select
          value={startNode}
          onChange={(e) => setStartNode(e.target.value)}
          className="p-2 border mr-4"
        >
          {graphData.nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>

        <label className="mr-2">Speed:</label>
        <select
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
          className="p-2 border"
        >
          <option value="2000">Slow</option>
          <option value="1000">Medium</option>
          <option value="500">Fast</option>
          <option value="200">Very Fast</option>
        </select>
      </div>

      <div className="mb-4">
        <button
          onClick={runAlgorithm}
          className="p-2 bg-red-500 text-white mr-2"
        >
          Initialize
        </button>

        <button
          onClick={toggleAnimation}
          className="p-2 bg-red-500 text-white mr-2"
          disabled={steps.length === 0}
        >
          {isRunning ? "Pause" : "Play"}
        </button>

        <button
          onClick={stepBackward}
          className="p-2 bg-gray-300 mr-2"
          disabled={stepIndex === 0 || steps.length === 0}
        >
          Step Back
        </button>

        <button
          onClick={stepForward}
          className="p-2 bg-gray-300 mr-2"
          disabled={stepIndex === steps.length - 1 || steps.length === 0}
        >
          Step Forward
        </button>

        <button
          onClick={resetVisualization}
          className="p-2 bg-gray-300"
          disabled={steps.length === 0}
        >
          Reset
        </button>
      </div>

      <div className="flex">
        <div className="w-two-thirds">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="border"
          ></svg>
        </div>

        <div className="w-one-third ml-4">
          <div className="p-4 bg-gray-100 h-64 overflow-auto">
            <h3 className="font-bold mb-2">Algorithm Status</h3>

            {steps.length > 0 && stepIndex < steps.length && (
              <div>
                <p className="mb-2">
                  Step {stepIndex + 1} of {steps.length}
                </p>
                <p>{steps[stepIndex].description}</p>

                {algorithm !== "dijkstra" && (
                  <div className="mt-4">
                    <p>
                      <strong>Visited:</strong>{" "}
                      {Array.from(steps[stepIndex].visited).join(", ")}
                    </p>

                    {steps[stepIndex].queue && (
                      <p>
                        <strong>Queue:</strong>{" "}
                        {steps[stepIndex].queue.join(", ")}
                      </p>
                    )}

                    {steps[stepIndex].stack && (
                      <p>
                        <strong>Stack:</strong>{" "}
                        {steps[stepIndex].stack.join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {algorithm === "dijkstra" && (
                  <div className="mt-4">
                    <p>
                      <strong>Distances:</strong>
                    </p>
                    <table className="w-full border-collapse mt-2">
                      <thead>
                        <tr>
                          <th className="border p-1 text-left">Node</th>
                          <th className="border p-1 text-left">Distance</th>
                          <th className="border p-1 text-left">Previous</th>
                        </tr>
                      </thead>
                      <tbody>
                        {graphData.nodes.map((node) => {
                          const dist = steps[stepIndex].distances.get(node.id);
                          const prev = steps[stepIndex].previous.get(node.id);

                          return (
                            <tr key={node.id}>
                              <td className="border p-1">{node.label}</td>
                              <td className="border p-1">
                                {dist === Infinity ? "∞" : dist}
                              </td>
                              <td className="border p-1">{prev || "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {steps.length === 0 && (
              <p>Select an algorithm and click Initialize to begin.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphTraversal;
