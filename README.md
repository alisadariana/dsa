# DSA - Data Structures and Algorithms

This repository contains interactive visualizations and explanations of common data structures and algorithms implemented in React with TypeScript. The project focuses on providing educational tools to help students understand complex data structures and algorithms through visual representations.

## 🚀 Live Demo

Visit the live application: [https://yourusername.github.io/dsa](https://yourusername.github.io/dsa)

## 📋 Current Features

- **Home Page**: Navigation hub with cards for each visualization
- **Hash Tables**: Interactive visualization and explanation of hash table operations
- **Graph Algorithms**: Interactive visualization of graph representations and algorithms:
  - Graph representations (adjacency matrix, adjacency list)
  - Graph traversal algorithms (BFS, DFS)
  - Shortest path algorithms (Dijkstra)
  - Support for directed/undirected and weighted/unweighted graphs

## 🏗️ Project Structure

```
dsa/
├── docs/           # Build output directory (used for GitHub Pages)
├── react/          # React application source code
│   ├── src/
│   │   ├── App.tsx                # Main application with routing
│   │   ├── App.css                # CSS utilities and styling
│   │   ├── index.tsx              # Entry point
│   │   ├── Home.tsx               # Home page with navigation cards
│   │   ├── Navbar.tsx             # Navigation bar component
│   │   ├── GraphVisualization.tsx # Main graph visualization page
│   │   ├── HashTableVisualization.tsx # Hash table visualization page
│   │   ├── components/
│   │   │   └── GraphTraversal.tsx # Graph traversal visualization component
│   │   ├── models/
│   │   │   ├── GraphModels.ts     # Graph data structures
│   │   │   └── GraphAlgorithms.ts # Graph algorithms implementation
│   │   └── utils/
│   │       └── GraphUtils.ts      # Utility functions for graphs
│   ├── public/                    # Public assets
└── README.md       # This file
```

## 🛠️ Technology Stack

- **React**: Frontend library (v19)
- **TypeScript**: Type safety and better developer experience
- **React Router**: Navigation between visualizations
- **CSS Utilities**: Custom utility classes for styling
- **D3.js**: Data visualizations
- **GitHub Pages**: Hosting

## ⚠️ Known Issues

- **Navigation Issue**: When on the Graph Visualization page (/graph), clicking on other navbar links may not work. This is likely due to the D3.js force simulation blocking the main thread. Navigation works fine between Home and Hash Table pages.

## 🔍 Implementation Details

### Graph Visualization

The Graph Visualization component uses D3.js force simulation to display interactive graph structures. It includes:

- **Graph Data Structure**: Implemented with TypeScript interfaces and classes for Node, Edge, and Graph
- **Visual Representation**: Interactive visualization with draggable nodes and automatic layout
- **Adjacency Representations**: Both adjacency matrix and adjacency list views
- **Algorithm Visualization**: Step-by-step visualization of graph traversal algorithms

### D3.js Optimizations

To improve performance, especially when deployed on GitHub Pages:

- Reduced force simulation strength and distance parameters
- Added alphaDecay and velocityDecay for faster stabilization
- Added automatic simulation stopping after initial layout
- Throttled certain operations to reduce computational load

## 🚦 Getting Started

1. Clone the repository

   ```
   git clone https://github.com/yourusername/dsa.git
   cd dsa
   ```

2. Install dependencies

   ```
   cd react
   npm install
   ```

3. Start the development server

   ```
   npm start
   ```

4. Build for production

   ```
   npm run build
   ```

5. Deploy to GitHub Pages
   ```
   npm run deploy
   ```

## 🔮 Future Plans

- Fix the navigation issue in the Graph Visualization page
- Implement sorting algorithm comparisons
- Add complexity analysis for each implementation
- Add binary tree visualization
- Enhance UI with dark mode support

## 📝 License

[MIT](LICENSE)

---

Feel free to contribute by opening issues or submitting pull requests!
