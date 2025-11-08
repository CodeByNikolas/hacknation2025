// ABOUTME: Floating zoom control buttons for programmatic graph zoom operations
// ABOUTME: Positioned at bottom-right with +/- buttons for zoom in/out and reset functionality

"use client";

import { useState } from "react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/**
 * ZoomControls component provides UI buttons for controlling graph zoom level.
 *
 * Features:
 * - Zoom In button (+): Increases zoom scale by 1.3x
 * - Zoom Out button (-): Decreases zoom scale by 0.77x (1/1.3)
 * - Reset button: Returns zoom to initial state (scale: 1, translate: [0, 0])
 * - Positioned at bottom-right corner with fixed positioning
 * - Dark theme styling with semi-transparent background and backdrop blur
 * - Hover and active states for visual feedback
 *
 * @param props - Callback functions for zoom operations
 */
export function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  const [isHovering, setIsHovering] = useState<string | null>(null);

  return (
    <div
      className="fixed bottom-6 right-6 flex flex-col gap-2 z-10"
      style={{
        // Semi-transparent background with backdrop blur
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        padding: "8px",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        onMouseEnter={() => setIsHovering("in")}
        onMouseLeave={() => setIsHovering(null)}
        className="flex items-center justify-center transition-all duration-200"
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: isHovering === "in" ? "rgba(59, 130, 246, 0.3)" : "rgba(30, 41, 59, 0.6)",
          color: isHovering === "in" ? "#60a5fa" : "#94a3b8",
          border: "1px solid",
          borderColor: isHovering === "in" ? "rgba(59, 130, 246, 0.5)" : "rgba(148, 163, 184, 0.2)",
          borderRadius: "8px",
          fontSize: "20px",
          fontWeight: "600",
          cursor: "pointer",
          userSelect: "none",
        }}
        aria-label="Zoom in"
        title="Zoom in (1.3x)"
      >
        +
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        onMouseEnter={() => setIsHovering("out")}
        onMouseLeave={() => setIsHovering(null)}
        className="flex items-center justify-center transition-all duration-200"
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: isHovering === "out" ? "rgba(59, 130, 246, 0.3)" : "rgba(30, 41, 59, 0.6)",
          color: isHovering === "out" ? "#60a5fa" : "#94a3b8",
          border: "1px solid",
          borderColor: isHovering === "out" ? "rgba(59, 130, 246, 0.5)" : "rgba(148, 163, 184, 0.2)",
          borderRadius: "8px",
          fontSize: "24px",
          fontWeight: "600",
          cursor: "pointer",
          userSelect: "none",
          lineHeight: "1",
        }}
        aria-label="Zoom out"
        title="Zoom out (0.77x)"
      >
        −
      </button>

      {/* Reset Button */}
      <button
        onClick={onReset}
        onMouseEnter={() => setIsHovering("reset")}
        onMouseLeave={() => setIsHovering(null)}
        className="flex items-center justify-center transition-all duration-200"
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: isHovering === "reset" ? "rgba(59, 130, 246, 0.3)" : "rgba(30, 41, 59, 0.6)",
          color: isHovering === "reset" ? "#60a5fa" : "#94a3b8",
          border: "1px solid",
          borderColor: isHovering === "reset" ? "rgba(59, 130, 246, 0.5)" : "rgba(148, 163, 184, 0.2)",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "600",
          cursor: "pointer",
          userSelect: "none",
        }}
        aria-label="Reset zoom"
        title="Reset zoom to default view"
      >
        ⟲
      </button>
    </div>
  );
}
