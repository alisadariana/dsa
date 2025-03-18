import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import HashTableVisualization from "./HashTableVisualization";
import { GraphProvider } from "./context/GraphContext";
import "./App.css";
import Navbar from "./components/Navbar";
import GraphPage from "./components/GraphPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container mx-auto mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/graph"
              element={
                <GraphProvider>
                  <GraphPage />
                </GraphProvider>
              }
            />
            <Route path="/hash-table" element={<HashTableVisualization />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
