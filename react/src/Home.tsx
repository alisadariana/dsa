import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Data Structures & Algorithms</h1>
        <p className="text-gray-500">
          Interactive visualizations of common data structures and algorithms
        </p>
      </header>

      <div className="flex">
        <div className="p-4 border mr-4 w-one-third">
          <h2 className="text-xl font-bold mb-2">Hash Table</h2>
          <p className="mb-4">
            Visualize how hash tables work with collision resolution
          </p>
          <Link
            to="/hash-table"
            className="block p-2 bg-red-500 text-white text-center"
          >
            Explore
          </Link>
        </div>

        {/* Graph visualization card */}
        <div className="p-4 border mr-4 w-one-third">
          <h2 className="text-xl font-bold mb-2">Graph Algorithms</h2>
          <p className="mb-4">
            Explore graph traversal algorithms and visualizations
          </p>
          <Link
            to="/graph"
            className="block p-2 bg-red-500 text-white text-center"
          >
            Explore
          </Link>
        </div>

        {/* Placeholder for future data structures */}
        <div className="p-4 border w-one-third bg-gray-100">
          <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
          <p className="mb-4 text-gray-500">Binary Trees</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
