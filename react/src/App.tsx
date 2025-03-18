import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HashTableVisualization from "./HashTableVisualization";
import GraphVisualization from "./GraphVisualization";
import Home from "./Home";
import Navbar from "./Navbar";

const App: React.FC = () => {
  const basename = process.env.PUBLIC_URL || "";

  return (
    <Router basename={basename}>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hash-table" element={<HashTableVisualization />} />
          <Route path="/graph" element={<GraphVisualization />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
