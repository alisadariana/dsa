import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/hash-table", label: "Hash Table" },
    { path: "/graph", label: "Graphs" },
  ];

  return (
    <nav className="bg-gray-100 p-4 border-b mb-4">
      <div className="flex items-center justify-between">
        <div className="font-bold text-xl">DSA Visualizer</div>
        <div className="flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mr-4 ${
                location.pathname === item.path
                  ? "font-bold text-red-500 border-b border-red-500 pb-1"
                  : "text-gray-700 hover:text-red-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
