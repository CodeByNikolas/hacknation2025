// ABOUTME: D3 utility functions for graph visualization styling and calculations
// ABOUTME: Maps data properties (volatility, correlation) to visual properties (colors, widths)

/**
 * Maps a node's volatility value (0-1) to a corresponding theme color.
 * Uses a 5-level color scale from light blue (calm) to dark blue (volatile).
 *
 * @param volatility - Value between 0 and 1 representing market volatility
 * @returns CSS color string matching the theme's volatility color scale
 */
export function getNodeColor(volatility: number): string {
  if (volatility < 0.2) {
    return "#dbeafe"; // very-low
  }
  if (volatility < 0.4) {
    return "#93c5fd"; // low
  }
  if (volatility < 0.6) {
    return "#3b82f6"; // medium
  }
  if (volatility < 0.8) {
    return "#1d4ed8"; // high
  }
  return "#1e3a8a"; // very-high
}

/**
 * Maps a connection's correlation value (0-1) to a line thickness in pixels.
 * Higher correlation results in thicker lines to emphasize stronger relationships.
 *
 * @param correlation - Value between 0 and 1 representing connection strength
 * @returns Line width in pixels (0.5px to 5px range)
 */
export function getConnectionWidth(correlation: number): number {
  // Linear mapping: 0 -> 0.5px, 1 -> 5px
  return 0.5 + correlation * 4.5;
}

/**
 * Returns the base color for connections from the theme.
 *
 * @returns CSS color string for connection lines
 */
export function getConnectionColor(): string {
  return "rgba(148, 163, 184, 0.3)"; // connection-base from theme
}

/**
 * Calculates the radius for a node based on its properties.
 * Currently uses a default radius, but can be extended to vary by data.
 *
 * @returns Node radius in pixels
 */
export function getNodeRadius(): number {
  return 8; // Default radius for all nodes
}
