// src/context/GraphContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  ReactNode,
} from "react";
import * as d3 from "d3";
import { Graph, GraphData } from "../models/GraphModels";
import { createSampleGraph } from "../utils/GraphUtils";

interface GraphContextType {
  graph: Graph;
  graphData: GraphData;
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined> | null;
  svgRef: React.RefObject<SVGSVGElement | null>;
  setGraph: (graph: Graph) => void;
  initializeSimulation: (
    width: number,
    height: number
  ) => d3.Simulation<d3.SimulationNodeDatum, undefined>;
  stopSimulation: () => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [graph, setGraph] = useState<Graph>(() =>
    createSampleGraph(false, false)
  );
  const [graphData, setGraphData] = useState<GraphData>(() =>
    graph.getGraphData()
  );
  const [simulation, setSimulation] = useState<d3.Simulation<
    d3.SimulationNodeDatum,
    undefined
  > | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Update graph data when graph changes
  const updateGraph = (newGraph: Graph) => {
    setGraph(newGraph);
    const newGraphData = newGraph.getGraphData();
    setGraphData(newGraphData);

    // Reset simulation on graph change to apply new properties
    if (simulation) {
      simulation.stop();
      setSimulation(null);
    }
  };

  // Initialize or update simulation
  const initializeSimulation = (width: number, height: number) => {
    // Stop existing simulation if any
    if (simulation) {
      simulation.stop();
    }

    // Create new simulation
    const newSimulation = d3
      .forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(graphData.edges)
          .id((d: any) => d.id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-120).distanceMax(150))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alpha(0.5)
      .alphaDecay(0.08)
      .velocityDecay(0.4);

    // Stop the simulation after initial layout
    setTimeout(() => {
      newSimulation.alphaTarget(0).stop();
    }, 2000);

    setSimulation(newSimulation);
    return newSimulation;
  };

  // Stop simulation
  const stopSimulation = () => {
    if (simulation) {
      simulation.stop();
    }
  };

  return (
    <GraphContext.Provider
      value={{
        graph,
        graphData,
        simulation,
        svgRef,
        setGraph: updateGraph,
        initializeSimulation,
        stopSimulation,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

// Custom hook to use the graph context
export const useGraph = (): GraphContextType => {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return context;
};
