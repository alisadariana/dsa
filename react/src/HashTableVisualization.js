import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

const HashTableVisualization = () => {
  const [bucketSize, setBucketSize] = useState(7);
  const [inputKey, setInputKey] = useState("");
  const [hashCalculation, setHashCalculation] = useState({
    key: "",
    hashValue: null,
  });
  const [hashTable, setHashTable] = useState([]);
  const [operations, setOperations] = useState([]);
  const [hashFunction, setHashFunction] = useState("sum");
  const [collisionStrategy, setCollisionStrategy] = useState("chaining");
  const svgRef = useRef();

  // Initialize hash table
  useEffect(() => {
    let newTable;

    if (collisionStrategy === "chaining") {
      // For chaining: array of arrays (buckets with lists)
      newTable = Array(bucketSize)
        .fill()
        .map(() => []);
    } else if (collisionStrategy === "open-addressing") {
      // For open addressing: array of objects with key, value and status
      newTable = Array(bucketSize)
        .fill()
        .map(() => ({ key: null, status: "empty" }));
    } else {
      // For no collision resolution: array of single values
      newTable = Array(bucketSize)
        .fill()
        .map(() => ({ key: null }));
    }

    setHashTable(newTable);
    setOperations([]);
  }, [bucketSize, collisionStrategy]);

  // Hash Functions
  const hashFunctions = useMemo(
    () => ({
      sum: (key) => {
        let sum = 0;
        for (let i = 0; i < key.length; i++) {
          sum += key.charCodeAt(i);
        }
        return sum % bucketSize;
      },
      firstChar: (key) => {
        return key.length > 0 ? key.charCodeAt(0) % bucketSize : 0;
      },
      length: (key) => {
        return key.length % bucketSize;
      },
      polynomial: (key) => {
        let hash = 0;
        const p = 31;
        for (let i = 0; i < key.length; i++) {
          hash += key.charCodeAt(i) * Math.pow(p, i);
        }
        return hash % bucketSize;
      },
    }),
    [bucketSize]
  );

  // Update hash calculation display when input changes
  useEffect(() => {
    if (inputKey.trim() !== "") {
      const hash = hashFunctions[hashFunction](inputKey);
      setHashCalculation({ key: inputKey, hashValue: hash });
    }
  }, [inputKey, hashFunction, hashFunctions]);

  // Insert a key
  const insertKey = () => {
    if (inputKey.trim() === "") return;

    const hash = hashFunctions[hashFunction](inputKey);
    let inserted = false;
    let finalPosition = hash;
    const newTable = [...hashTable];

    if (collisionStrategy === "chaining") {
      // Chaining approach: add to linked list
      const keyExists = newTable[hash].some((item) => item === inputKey);

      if (!keyExists) {
        newTable[hash] = [...newTable[hash], inputKey];
        inserted = true;
      }
    } else if (collisionStrategy === "open-addressing") {
      // Open addressing: linear probing
      let position = hash;
      let i = 0;

      while (i < bucketSize) {
        if (newTable[position].key === inputKey) {
          // Key already exists
          break;
        }

        if (
          newTable[position].status === "empty" ||
          newTable[position].status === "deleted"
        ) {
          // Found an empty or deleted slot
          newTable[position] = { key: inputKey, status: "filled" };
          inserted = true;
          finalPosition = position;
          break;
        }

        // Linear probing
        position = (position + 1) % bucketSize;
        i++;
      }

      if (i === bucketSize) {
        // Table is full
        alert("Hash table is full!");
      }
    } else {
      // No collision resolution
      if (newTable[hash].key === null) {
        newTable[hash] = { key: inputKey };
        inserted = true;
      } else if (newTable[hash].key !== inputKey) {
        alert("Collision detected! Cannot insert key.");
      }
    }

    if (inserted) {
      setHashTable(newTable);

      setOperations((prev) => [
        ...prev,
        {
          type: "insert",
          key: inputKey,
          hash,
          finalPosition,
          timestamp: Date.now(),
        },
      ]);
    }

    setInputKey("");
  };

  // Find a key
  const findKey = () => {
    if (inputKey.trim() === "") return;

    const hash = hashFunctions[hashFunction](inputKey);
    let found = false;
    let finalPosition = hash;

    if (collisionStrategy === "chaining") {
      // Chaining: search the linked list
      found = hashTable[hash].includes(inputKey);
    } else if (collisionStrategy === "open-addressing") {
      // Open addressing: probe until key found or empty slot
      let position = hash;
      let i = 0;

      while (i < bucketSize) {
        if (hashTable[position].status === "empty") {
          // Found empty slot (not deleted), key doesn't exist
          break;
        }

        if (
          hashTable[position].status === "filled" &&
          hashTable[position].key === inputKey
        ) {
          // Found the key
          found = true;
          finalPosition = position;
          break;
        }

        // Continue probing
        position = (position + 1) % bucketSize;
        i++;
      }
    } else {
      // No collision resolution: just check the slot
      found = hashTable[hash].key === inputKey;
    }

    setOperations((prev) => [
      ...prev,
      {
        type: "find",
        key: inputKey,
        hash,
        finalPosition,
        found,
        timestamp: Date.now(),
      },
    ]);

    setInputKey("");
  };

  // Delete a key
  const deleteKey = () => {
    if (inputKey.trim() === "") return;

    const hash = hashFunctions[hashFunction](inputKey);
    let deleted = false;
    let finalPosition = hash;
    const newTable = [...hashTable];

    if (collisionStrategy === "chaining") {
      // Chaining: remove from linked list
      const keyIndex = newTable[hash].indexOf(inputKey);

      if (keyIndex !== -1) {
        newTable[hash] = newTable[hash].filter((item) => item !== inputKey);
        deleted = true;
      }
    } else if (collisionStrategy === "open-addressing") {
      // Open addressing: mark as deleted but don't remove (tombstone)
      let position = hash;
      let i = 0;

      while (i < bucketSize) {
        if (newTable[position].status === "empty") {
          // Key not found
          break;
        }

        if (
          newTable[position].status === "filled" &&
          newTable[position].key === inputKey
        ) {
          // Found the key, mark as deleted
          newTable[position] = { key: null, status: "deleted" };
          deleted = true;
          finalPosition = position;
          break;
        }

        // Continue probing
        position = (position + 1) % bucketSize;
        i++;
      }
    } else {
      // No collision resolution: just clear the slot if it matches
      if (newTable[hash].key === inputKey) {
        newTable[hash] = { key: null };
        deleted = true;
      }
    }

    if (deleted) {
      setHashTable(newTable);

      setOperations((prev) => [
        ...prev,
        {
          type: "delete",
          key: inputKey,
          hash,
          finalPosition,
          timestamp: Date.now(),
        },
      ]);
    }

    setInputKey("");
  };

  // Clear operations log
  const clearOperations = () => {
    setOperations([]);
  };

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;
    const bucketHeight = 40;
    const bucketWidth = 120;
    const gap = 20;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr(
        "height",
        Math.max(height, bucketSize * (bucketHeight + gap) + gap)
      );

    // Define arrow marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#333");

    // Draw bucket rectangles
    const bucketGroups = svg
      .selectAll(".bucket")
      .data(hashTable)
      .enter()
      .append("g")
      .attr("class", "bucket")
      .attr(
        "transform",
        (d, i) => `translate(60, ${i * (bucketHeight + gap) + gap})`
      );

    // Draw index labels
    bucketGroups
      .append("text")
      .attr("x", -10)
      .attr("y", bucketHeight / 2 + 5)
      .attr("text-anchor", "end")
      .text((d, i) => i);

    // Draw bucket rectangles
    bucketGroups
      .append("rect")
      .attr("width", bucketWidth)
      .attr("height", bucketHeight)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    if (collisionStrategy === "chaining") {
      // Draw linked list for each bucket
      bucketGroups.each(function (bucket, bucketIndex) {
        const g = d3.select(this);

        bucket.forEach((key, i) => {
          // Draw node rectangle
          g.append("rect")
            .attr("x", bucketWidth + i * 120 + 20)
            .attr("y", 0)
            .attr("width", 100)
            .attr("height", bucketHeight)
            .attr("fill", "white")
            .attr("stroke", "#333")
            .attr("stroke-width", 1);

          // Draw key text
          g.append("text")
            .attr("x", bucketWidth + i * 120 + 70)
            .attr("y", bucketHeight / 2 + 5)
            .attr("text-anchor", "middle")
            .text(key);

          // Draw arrow if not last item
          if (i < bucket.length - 1) {
            g.append("line")
              .attr("x1", bucketWidth + i * 120 + 120)
              .attr("y1", bucketHeight / 2)
              .attr("x2", bucketWidth + (i + 1) * 120 + 20)
              .attr("y2", bucketHeight / 2)
              .attr("stroke", "#333")
              .attr("stroke-width", 1)
              .attr("marker-end", "url(#arrow)");
          }
        });

        // If bucket is empty, show null
        if (bucket.length === 0) {
          g.append("text")
            .attr("x", bucketWidth / 2)
            .attr("y", bucketHeight / 2 + 5)
            .attr("text-anchor", "middle")
            .text("NULL");
        } else {
          // Draw arrow from bucket to first node
          g.append("line")
            .attr("x1", bucketWidth)
            .attr("y1", bucketHeight / 2)
            .attr("x2", bucketWidth + 20)
            .attr("y2", bucketHeight / 2)
            .attr("stroke", "#333")
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#arrow)");
        }
      });
    } else if (
      collisionStrategy === "open-addressing" ||
      collisionStrategy === "none"
    ) {
      // Draw cell content for each bucket
      bucketGroups.each(function (slot, i) {
        const g = d3.select(this);

        // Draw key text
        if (collisionStrategy === "open-addressing") {
          // Fill color based on status
          g.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", bucketWidth)
            .attr("height", bucketHeight)
            .attr(
              "fill",
              slot.status === "empty"
                ? "white"
                : slot.status === "deleted"
                ? "#ffcccc"
                : "#e6ffe6"
            )
            .attr("stroke", "#333")
            .attr("stroke-width", 2);

          g.append("text")
            .attr("x", bucketWidth / 2)
            .attr("y", bucketHeight / 2 + 5)
            .attr("text-anchor", "middle")
            .text(
              slot.status === "filled"
                ? slot.key
                : slot.status === "deleted"
                ? "DELETED"
                : "EMPTY"
            );
        } else {
          // No collision strategy - simple slot
          g.append("text")
            .attr("x", bucketWidth / 2)
            .attr("y", bucketHeight / 2 + 5)
            .attr("text-anchor", "middle")
            .text(slot.key !== null ? slot.key : "NULL");
        }
      });
    }
  }, [hashTable, bucketSize, collisionStrategy]);

  // Format operation result
  const formatOperation = (op) => {
    switch (op.type) {
      case "insert":
        if (
          collisionStrategy === "open-addressing" &&
          op.hash !== op.finalPosition
        ) {
          return `INSERT: Key "${op.key}" hash=${op.hash}, placed at position ${op.finalPosition} (collision resolved)`;
        }
        return `INSERT: Key "${op.key}" inserted at bucket ${op.hash}`;
      case "find":
        if (
          collisionStrategy === "open-addressing" &&
          op.found &&
          op.hash !== op.finalPosition
        ) {
          return `FIND: Key "${op.key}" found at position ${op.finalPosition} (probed from ${op.hash})`;
        }
        return `FIND: Key "${op.key}" ${
          op.found ? "found" : "not found"
        } in bucket ${op.hash}`;
      case "delete":
        if (
          collisionStrategy === "open-addressing" &&
          op.hash !== op.finalPosition
        ) {
          return `DELETE: Key "${op.key}" deleted from position ${op.finalPosition} (probed from ${op.hash})`;
        }
        return `DELETE: Key "${op.key}" deleted from bucket ${op.hash}`;
      default:
        return "";
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hash Table Visualization</h1>

      <div className="mb-6">
        <div className="flex mb-2">
          <div className="mr-4">
            <label className="block mb-1">Bucket Size:</label>
            <select
              className="border p-2 w-full"
              value={bucketSize}
              onChange={(e) => setBucketSize(parseInt(e.target.value))}
            >
              {[5, 7, 11, 13, 17, 19].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="mr-4">
            <label className="block mb-1">Hash Function:</label>
            <select
              className="border p-2 w-full"
              value={hashFunction}
              onChange={(e) => setHashFunction(e.target.value)}
            >
              <option value="sum">Sum of ASCII Codes</option>
              <option value="firstChar">First Character</option>
              <option value="length">String Length</option>
              <option value="polynomial">Polynomial Hash</option>
            </select>
          </div>

          <div className="mr-4">
            <label className="block mb-1">Collision Strategy:</label>
            <select
              className="border p-2 w-full"
              value={collisionStrategy}
              onChange={(e) => setCollisionStrategy(e.target.value)}
            >
              <option value="none">None (No Resolution)</option>
              <option value="chaining">Chaining</option>
              <option value="open-addressing">Open Addressing</option>
            </select>
          </div>
        </div>

        <div className="flex items-end">
          <div className="mr-4 flex-grow">
            <label className="block mb-1">Key:</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && insertKey()}
            />
          </div>

          <div className="flex">
            <button
              className="bg-blue-500 text-white p-2 mr-2"
              onClick={insertKey}
            >
              Insert
            </button>
            <button
              className="bg-green-500 text-white p-2 mr-2"
              onClick={findKey}
            >
              Find
            </button>
            <button className="bg-red-500 text-white p-2" onClick={deleteKey}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="border p-3 mb-2 bg-gray-100">
        <h3 className="font-bold">Hash Calculation:</h3>
        {inputKey ? (
          <div>
            <p className="mb-1">
              <code>
                hash("{inputKey}") = {hashCalculation.hashValue} % {bucketSize}{" "}
                = {hashCalculation.hashValue % bucketSize}
              </code>
            </p>
            {hashFunction === "sum" && (
              <p className="text-sm">
                Sum of ASCII codes:{" "}
                {Array.from(inputKey)
                  .map((c) => c.charCodeAt(0))
                  .join(" + ")}
              </p>
            )}
            {hashFunction === "polynomial" && (
              <p className="text-sm">
                31^0*{inputKey.charCodeAt(0) || 0} + 31^1*
                {inputKey.charCodeAt(1) || 0} + ...
              </p>
            )}
          </div>
        ) : (
          <p>Enter a key to see its hash value</p>
        )}
      </div>

      <div className="flex">
        <div
          className="mr-4 flex-grow overflow-auto"
          style={{ maxHeight: "500px" }}
        >
          <h2 className="text-xl font-bold mb-2">Hash Table Structure</h2>
          <svg ref={svgRef} width="800" height="400"></svg>
        </div>

        <div className="w-1/3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Operations Log</h2>
            <button
              className="bg-gray-300 text-gray-700 p-1 text-sm"
              onClick={clearOperations}
            >
              Clear
            </button>
          </div>

          <div className="border p-2 h-64 overflow-auto">
            {operations.length === 0 ? (
              <p className="text-gray-500">No operations performed yet</p>
            ) : (
              <ul>
                {operations.map((op, i) => (
                  <li key={i} className="mb-1 pb-1 border-b">
                    {formatOperation(op)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Implementation Details</h2>
            <div className="border p-3 mb-3">
              <p className="mb-2">
                <strong>Hash Function:</strong>{" "}
                {hashFunction === "sum"
                  ? "Sum of ASCII Codes"
                  : hashFunction === "firstChar"
                  ? "First Character"
                  : hashFunction === "length"
                  ? "String Length"
                  : "Polynomial Hash"}
              </p>
              <p className="text-sm">
                {hashFunction === "sum" &&
                  "Adds ASCII codes of all characters, then takes modulo of bucket size"}
                {hashFunction === "firstChar" &&
                  "Uses only the first character's ASCII code, then takes modulo of bucket size"}
                {hashFunction === "length" &&
                  "Uses the length of the string, then takes modulo of bucket size"}
                {hashFunction === "polynomial" &&
                  "Computes hash = sum(char_code[i] * p^i) mod bucket_size where p=31"}
              </p>
            </div>

            <div className="border p-3">
              <p className="mb-2">
                <strong>Collision Strategy:</strong>{" "}
                {collisionStrategy === "none"
                  ? "None"
                  : collisionStrategy === "chaining"
                  ? "Chaining"
                  : "Open Addressing (Linear Probing)"}
              </p>
              <p className="text-sm">
                {collisionStrategy === "none" &&
                  "No collision handling - insertions fail if the bucket is already occupied"}
                {collisionStrategy === "chaining" &&
                  "Collisions are resolved by maintaining a linked list of elements that hash to the same bucket"}
                {collisionStrategy === "open-addressing" &&
                  "When a collision occurs, the algorithm searches for the next available slot using linear probing"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">
          How to Use This Visualization
        </h2>
        <ul className="list-disc pl-6">
          <li>
            Adjust the <strong>Bucket Size</strong> to see how it affects
            collision frequency
          </li>
          <li>
            Select different <strong>Hash Functions</strong> to observe
            distribution patterns
          </li>
          <li>
            Change <strong>Collision Strategy</strong> to compare the three
            approaches from the lab:
            <ul className="list-disc pl-6 mt-1">
              <li>
                <strong>None</strong>: No collision handling (insertion fails on
                collision)
              </li>
              <li>
                <strong>Chaining</strong>: Linked lists for each bucket (from
                lab assignment 6.3.1)
              </li>
              <li>
                <strong>Open Addressing</strong>: Linear probing (from lab
                assignment 6.3.2)
              </li>
            </ul>
          </li>
          <li>
            Enter keys in the input field and use <strong>Insert</strong>,{" "}
            <strong>Find</strong>, and <strong>Delete</strong> operations
          </li>
          <li>
            Monitor the <strong>Operations Log</strong> to track hash
            calculations and collision resolutions
          </li>
          <li>
            Observe visual representations of each data structure implementation
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HashTableVisualization;
