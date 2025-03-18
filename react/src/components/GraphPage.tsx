import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  createSampleGraph,
  formatAdjacencyMatrix,
  formatAdjacencyList,
} from "../utils/GraphUtils";
import { useGraph } from "../context/GraphContext";
import { useD3Visualization } from "../hooks/useD3Visualization";
import {
  TraversalStep,
  breadthFirstTraversal,
  depthFirstTraversal,
  DijkstraStep,
  dijkstraAlgorithm,
} from "../models/GraphAlgorithms";
import DataStructureVisualization from "./DataStructureVisualization";

/**
 * GraphPage - Unified component for graph visualization and traversal
 * Combines functionality of previous GraphVisualization and GraphTraversal components
 */
const GraphPage: React.FC = () => {
  // Graph context and visualization hooks
  const { graph, graphData, svgRef, setGraph } = useGraph();
  const { updateNodeColors, highlightEdge } = useD3Visualization(800, 500);

  // Graph representation state
  const [adjacencyMatrix, setAdjacencyMatrix] = useState<string>("");
  const [adjacencyList, setAdjacencyList] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "visualization" | "matrix" | "list"
  >("visualization");

  // Algorithm state
  const [algorithm, setAlgorithm] = useState<"bfs" | "dfs" | "dijkstra">("bfs");
  const [startNode, setStartNode] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [steps, setSteps] = useState<any[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Update graph representations when graph changes
  useEffect(() => {
    try {
      const matrix = graph.getAdjacencyMatrix();
      const nodeIds = graphData.nodes.map((node) => node.id);
      setAdjacencyMatrix(formatAdjacencyMatrix(matrix, nodeIds));

      const adjList = graph.getAdjacencyList();
      setAdjacencyList(formatAdjacencyList(adjList));
    } catch (error) {
      console.error("Error updating graph representations:", error);
    }
  }, [graph, graphData]);

  // Set default start node when graph data changes
  useEffect(() => {
    if (graphData.nodes.length > 0 && startNode === "") {
      setStartNode(graphData.nodes[0].id);
    }
  }, [graphData.nodes, startNode]);

  // Update visualization based on current step
  useEffect(() => {
    if (steps.length === 0 || stepIndex >= steps.length) return;

    const currentStep = steps[stepIndex];

    updateNodeColors(Array.from(currentStep.visited), currentStep.current);

    highlightEdge(currentStep.sourceNode, currentStep.targetNode);
  }, [steps, stepIndex, updateNodeColors, highlightEdge]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const toggleDirected = () => {
    const newGraph = createSampleGraph(!graph.directed, graph.weighted);
    setGraph(newGraph);
    resetVisualization();
  };

  const toggleWeighted = () => {
    const newGraph = createSampleGraph(graph.directed, !graph.weighted);
    setGraph(newGraph);
    resetVisualization();
  };

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

  const stepBackward = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const resetVisualization = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);
    setStepIndex(0);
    setSteps([]);

    // Reset node colors
    updateNodeColors();
  };

  const renderAlgorithmStatus = () => {
    if (steps.length === 0) {
      return <p>Select an algorithm and click Initialize to begin.</p>;
    }

    if (stepIndex >= steps.length) {
      return <p>Algorithm completed.</p>;
    }

    const currentStep = steps[stepIndex];

    return (
      <div>
        <p className="mb-2">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <p className="mb-4">{currentStep.description}</p>

        {algorithm !== "dijkstra" && (
          <div className="mt-4">
            <div className="flex flex-col mb-4">
              <strong className="mb-2">Visited Nodes:</strong>
              <div className="flex flex-wrap gap-1">
                {Array.from(currentStep.visited).map((nodeId) => (
                  <span
                    key={String(nodeId)}
                    className="px-2 py-1 bg-blue-100 border border-blue-300 text-sm rounded-md"
                  >
                    {String(nodeId)}
                  </span>
                ))}
              </div>
            </div>

            {/* Data structure visualization */}
            {algorithm === "bfs" && currentStep.queue && (
              <DataStructureVisualization
                type="queue"
                items={currentStep.queue}
                className="mb-4"
              />
            )}

            {algorithm === "dfs" && currentStep.stack && (
              <DataStructureVisualization
                type="stack"
                items={currentStep.stack}
                className="mb-4"
              />
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
                  const dist = currentStep.distances.get(node.id);
                  const prev = currentStep.previous.get(node.id);

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
    );
  };

  return (
    <div className="p-4">
      {/* Single-Row Graph Controls */}
      <div className="mb-3 p-2 border bg-gray-100 flex flex-wrap items-center gap-6">
        {/* Graph Type */}
        <div className="mr-4 flex items-center">
          <span className="mr-2 text-sm">Type:</span>
          <button
            onClick={toggleDirected}
            className={`p-1 text-sm ${
              graph.directed ? "bg-red-500" : "bg-gray-300"
            } text-white`}
          >
            {graph.directed ? "Directed" : "Undirected"}
          </button>
        </div>

        {/* Graph Weights */}
        <div className="mr-4 flex items-center">
          <span className="mr-2 text-sm">Weights:</span>
          <button
            onClick={toggleWeighted}
            className={`p-1 text-sm ${
              graph.weighted ? "bg-red-500" : "bg-gray-300"
            } text-white`}
          >
            {graph.weighted ? "Weighted" : "Unweighted"}
          </button>
        </div>

        {/* Algorithm */}
        <div className="mr-4 flex items-center">
          <span className="mr-2 text-sm">Algorithm:</span>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as any)}
            className="p-1 text-sm border"
          >
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="dijkstra">Dijkstra</option>
          </select>
        </div>

        {/* Start Node */}
        <div className="mr-4 flex items-center">
          <span className="mr-2 text-sm">Start:</span>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            className="p-1 text-sm border"
          >
            {graphData.nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>

        {/* Speed */}
        <div className="mr-4 flex items-center">
          <span className="mr-2 text-sm">Speed:</span>
          <select
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
            className="p-1 text-sm border"
          >
            <option value="2000">Slow</option>
            <option value="1000">Medium</option>
            <option value="500">Fast</option>
            <option value="200">Fast+</option>
          </select>
        </div>

        {/* Vertical divider */}
        <div className="h-6 border-r border-gray-300"></div>

        {/* Algorithm controls */}
        <div className="mr-2 flex items-center gap-2">
          <button
            onClick={runAlgorithm}
            className="p-1 text-sm bg-red-500 text-white"
          >
            Init
          </button>
          <button
            onClick={toggleAnimation}
            disabled={steps.length === 0}
            className={`p-1 text-sm ${
              isRunning ? "bg-gray-300" : "bg-red-500"
            } text-white`}
          >
            {isRunning ? "⏸" : "▶"}
          </button>
          <button
            onClick={stepBackward}
            disabled={stepIndex === 0 || steps.length === 0}
            className="p-1 text-sm bg-gray-300"
          >
            ◀
          </button>
          <button
            onClick={stepForward}
            disabled={stepIndex === steps.length - 1 || steps.length === 0}
            className="p-1 text-sm bg-gray-300"
          >
            ▶
          </button>
          <button
            onClick={resetVisualization}
            disabled={steps.length === 0}
            className="p-1 text-sm bg-gray-300"
          >
            ↺
          </button>
        </div>

        {/* Step indicator */}
        {steps.length > 0 && (
          <div className="text-sm text-gray-700">
            Step {stepIndex + 1}/{steps.length}
          </div>
        )}
      </div>

      {/* Main Content Section */}
      <div className="flex flex-wrap">
        {/* Left Column: Graph Visualization */}
        <div className="w-two-thirds pr-4">
          {/* Visualization Area */}
          <div className="p-4 border mb-4">
            <div
              className="bg-gray-100 p-2"
              style={{ height: "500px", overflow: "hidden" }}
            >
              <svg ref={svgRef} width="100%" height="100%"></svg>
            </div>
          </div>
        </div>

        {/* Right Column: Algorithm Status and Graph Representations */}
        <div className="w-one-third">
          {/* Tab Navigation */}
          <div className="flex border-b mb-4">
            <button
              className={`p-2 ${
                activeTab === "visualization"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100"
              }`}
              onClick={() => setActiveTab("visualization")}
            >
              Algorithm Status
            </button>
            <button
              className={`p-2 ${
                activeTab === "matrix" ? "bg-red-500 text-white" : "bg-gray-100"
              }`}
              onClick={() => setActiveTab("matrix")}
            >
              Matrix
            </button>
            <button
              className={`p-2 ${
                activeTab === "list" ? "bg-red-500 text-white" : "bg-gray-100"
              }`}
              onClick={() => setActiveTab("list")}
            >
              List
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 border h-64 overflow-auto mb-4">
            {activeTab === "visualization" && (
              <div>
                <h3 className="font-bold mb-2">Algorithm Status</h3>
                {renderAlgorithmStatus()}
              </div>
            )}

            {activeTab === "matrix" && (
              <div>
                <h3 className="font-bold mb-2">Adjacency Matrix</h3>
                <pre className="bg-gray-100 p-2 overflow-x-auto">
                  {adjacencyMatrix}
                </pre>
              </div>
            )}

            {activeTab === "list" && (
              <div>
                <h3 className="font-bold mb-2">Adjacency List</h3>
                <pre className="bg-gray-100 p-2 overflow-x-auto">
                  {adjacencyList}
                </pre>
              </div>
            )}
          </div>

          {/* Algorithm Explanation Section */}
          <div className="p-4 border">
            <h3 className="font-bold mb-2">About {algorithm.toUpperCase()}</h3>
            {algorithm === "bfs" && (
              <p>
                Breadth-First Search explores a graph level by level, visiting
                all neighbors of a node before moving to the next level.
                Effective for finding shortest paths in unweighted graphs.
              </p>
            )}
            {algorithm === "dfs" && (
              <p>
                Depth-First Search explores a graph by going as deep as possible
                along each branch before backtracking. Useful for topological
                sorting, cycle detection, and connectivity analysis.
              </p>
            )}
            {algorithm === "dijkstra" && (
              <p>
                Dijkstra's Algorithm finds the shortest paths from a source node
                to all other nodes in a weighted graph with non-negative edge
                weights, using a greedy approach.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-6">
        <Link to="/" className="p-2 bg-red-500 text-white">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default GraphPage;
