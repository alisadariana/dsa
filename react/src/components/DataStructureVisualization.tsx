// In a new file: components/DataStructureVisualization.tsx
import React from "react";

type DataStructureProps = {
  type: "queue" | "stack";
  items: string[];
  className?: string;
};

const DataStructureVisualization: React.FC<DataStructureProps> = ({
  type,
  items,
  className = "",
}) => {
  // Empty state display
  if (items.length === 0) {
    return (
      <div className={`p-2 bg-gray-100 border ${className}`}>
        <div className="text-sm font-bold mb-1">{type === "queue" ? "Queue" : "Stack"}</div>
        <div className="text-sm text-gray-500 text-center p-2">Empty</div>
      </div>
    );
  }

  // For stack, display items in reverse for visualization (top of stack at the top)
  const displayItems = type === "stack" ? [...items].reverse() : items;
  
  return (
    <div className={`p-2 bg-gray-100 border ${className}`}>
      <div className="text-sm font-bold mb-1">{type === "queue" ? "Queue" : "Stack"}</div>
      <div className="flex flex-col">
        {displayItems.map((item, index) => (
          <div
            key={index}
            className={`p-1 border mb-1 text-sm ${
              type === "queue" && index === 0
                ? "bg-red-100 border-red-300" // First to be dequeued (front)
                : type === "stack" && index === 0
                ? "bg-red-100 border-red-300" // First to be popped (top)
                : "bg-white"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      
      {/* Indicators for queue head/tail or stack top/bottom */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        {type === "queue" ? (
          <>
            <div>← Front (Dequeue)</div>
            <div>Back (Enqueue) →</div>
          </>
        ) : (
          <>
            <div>← Top (Pop)</div>
            <div>Bottom →</div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataStructureVisualization;
