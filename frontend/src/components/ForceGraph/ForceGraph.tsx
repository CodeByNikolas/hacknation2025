// ABOUTME: Main force-directed graph visualization component for displaying trading network
// ABOUTME: Renders nodes and connections using D3 force simulation with SVG, applying theme-based styling

"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import type { GraphData } from "@/types/graph";
import { useForceSimulation } from "@/hooks/useForceSimulation";
import {
  getNodeColor,
  getConnectionWidth,
  getConnectionColor,
  getNodeRadius,
} from "@/lib/d3-helpers";

interface ForceGraphProps {
  data: GraphData;
}

/**
 * ForceGraph component renders a force-directed network graph visualization.
 *
 * Features:
 * - Physics-based node positioning using D3 force simulation
 * - Nodes colored by volatility level
 * - Connections styled by correlation strength
 * - Smooth animations as the simulation stabilizes
 * - Responsive to container dimensions
 *
 * @param props - Graph data
 */
export function ForceGraph({ data }: ForceGraphProps) {
  // Create a stable mutable copy of the data ONCE using useState with lazy initialization
  // D3 will mutate these objects in place (adding x, y, vx, vy properties)
  // We must use the same object references for both simulation and rendering
  // Using useState with a function ensures the copy is created only once on mount
  const [mutableData] = useState(() => {
    // Deduplicate nodes by ID to prevent React key errors
    const nodeMap = new Map<string, typeof data.nodes[0]>();
    data.nodes.forEach(node => {
      if (!nodeMap.has(node.id)) {
        nodeMap.set(node.id, { ...node });
      }
    });
    const uniqueNodes = Array.from(nodeMap.values());

    return {
      nodes: uniqueNodes,
      connections: data.connections.map((conn) => ({ ...conn })),
      hotTrades: data.hotTrades,
    };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // State to trigger re-renders on simulation tick
  const [, setTick] = useState(0);

  // Measure container dimensions on mount and window resize
  useEffect(() => {
    const measureContainer = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial measurement
    measureContainer();

    // Re-measure on window resize
    window.addEventListener("resize", measureContainer);

    return () => {
      window.removeEventListener("resize", measureContainer);
    };
  }, []);

  // Callback to force re-render when simulation updates node positions
  const handleTick = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  // Initialize and manage D3 force simulation
  // Pass the mutable copies - D3 will update these in place
  useForceSimulation({
    nodes: mutableData.nodes,
    connections: mutableData.connections,
    width: dimensions.width,
    height: dimensions.height,
    onTick: handleTick,
  });

  const nodeRadius = getNodeRadius();
  const connectionColor = getConnectionColor();

  // Don't render until we have measured dimensions
  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full bg-graph-bg flex items-center justify-center"
      >
        <div className="text-text-secondary">Initializing graph...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-graph-bg">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ display: "block" }}
      >
      {/* Container group for future zoom/pan transformations */}
      <g>
        {/* Render connections first (behind nodes) */}
        <g className="connections">
          {mutableData.connections.map((connection, index) => {
            // D3 converts string IDs to node references after simulation start
            const source =
              typeof connection.source === "string"
                ? mutableData.nodes.find((n) => n.id === connection.source)
                : connection.source;

            const target =
              typeof connection.target === "string"
                ? mutableData.nodes.find((n) => n.id === connection.target)
                : connection.target;

            // Skip rendering if nodes aren't found or don't have positions yet
            if (
              !source ||
              !target ||
              source.x === undefined ||
              source.y === undefined ||
              target.x === undefined ||
              target.y === undefined
            ) {
              return null;
            }

            const strokeWidth = getConnectionWidth(connection.correlation);

            return (
              <line
                key={`connection-${index}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={connectionColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Render nodes on top of connections */}
        <g className="nodes">
          {mutableData.nodes.map((node, nodeIndex) => {
            // Skip rendering if node doesn't have position yet
            if (node.x === undefined || node.y === undefined) {
              return null;
            }

            const fillColor = getNodeColor(node.volatility);

            return (
              <g key={`node-${node.id}-${nodeIndex}`} className="node">
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={fillColor}
                  stroke="#1e293b"
                  strokeWidth={1.5}
                  style={{
                    cursor: "pointer",
                  }}
                />

                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y - nodeRadius - 4}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={10}
                  fontFamily="var(--font-geist-sans), system-ui, sans-serif"
                  style={{
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </g>
      </g>
      </svg>
    </div>
  );
}
