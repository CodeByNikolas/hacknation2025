// ABOUTME: D3 utility functions for graph visualization styling and calculations
// ABOUTME: Maps data properties (volatility, correlation) to visual properties (colors, widths)

import type {
  VolatilityThresholds,
  PressureThresholds,
} from "../utils/percentile";

/**
 * Maps a node's volatility value to a color based on dynamic percentile thresholds.
 * Color scale:
 * - Below 40th percentile: white (#ffffff)
 * - 40th-60th percentile: very light blue (#dbeafe)
 * - 60th-80th percentile: light to standard blue (gradient)
 * - Above 80th percentile: dark blue (#1e3a8a)
 *
 * @param volatility - Value between 0 and 1 representing market volatility
 * @param thresholds - Dynamic percentile thresholds for color mapping
 * @returns CSS color string for the node
 */
export function getNodeColorWithThresholds(
  volatility: number,
  thresholds: VolatilityThresholds
): string {
  // Bottom 40% - white
  if (volatility < thresholds.p40) {
    return "#ffffff";
  }

  // 40th to 60th percentile - very light blue
  if (volatility < thresholds.p60) {
    return "#dbeafe";
  }

  // 60th to 80th percentile - gradient from light blue to standard blue
  if (volatility < thresholds.p80) {
    // Interpolate between light blue (#93c5fd) and standard blue (#3b82f6)
    const range = thresholds.p80 - thresholds.p60;
    const position = (volatility - thresholds.p60) / range;

    // Linear interpolation between RGB values
    const startColor = { r: 147, g: 197, b: 253 }; // #93c5fd
    const endColor = { r: 59, g: 130, b: 246 }; // #3b82f6

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * position);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * position);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * position);

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Top 20% - dark blue
  return "#1e3a8a";
}

/**
 * Maps a node's volatility value (0-1) to a corresponding theme color.
 * Uses a 4-tier color scale as specified:
 * - < 0.3: very light blue (calm)
 * - 0.3-0.5: light blue
 * - 0.5-0.7: standard blue
 * - > 0.7: dark blue (highly volatile)
 *
 * @param volatility - Value between 0 and 1 representing market volatility
 * @returns CSS color string matching the theme's volatility color scale
 * @deprecated Use getNodeColorWithThresholds for dynamic percentile-based colors
 */
export function getNodeColor(volatility: number): string {
  if (volatility < 0.3) {
    return "#dbeafe"; // very light blue
  }
  if (volatility < 0.5) {
    return "#93c5fd"; // light blue
  }
  if (volatility < 0.7) {
    return "#3b82f6"; // standard blue
  }
  return "#1e3a8a"; // dark blue
}

/**
 * Maps a connection's correlation value (0-1) to a line thickness in pixels.
 * Higher correlation results in thicker lines to emphasize stronger relationships.
 *
 * @param correlation - Value between 0 and 1 representing connection strength
 * @returns Line width in pixels (0.3px to 2.5px range)
 */
export function getConnectionWidth(correlation: number): number {
  // Linear mapping: 0 -> 0.3px, 1 -> 2.5px
  // Reduced thickness for more elegant visualization
  return 0.3 + correlation * 2.2;
}

/**
 * Maps a connection's pressure and correlation to an enhanced line thickness.
 * Combines both pressure and correlation for more dramatic visual differences.
 *
 * @param correlation - Value between 0 and 1 representing connection strength
 * @param pressure - Value between 0 and 1 representing connection pressure
 * @returns Line width in pixels with enhanced scaling
 */
export function getEnhancedConnectionWidth(
  correlation: number,
  pressure: number
): number {
  // Base width from correlation (0.2 to 1.5 range)
  const baseWidth = 0.2 + correlation * 1.3;

  // Pressure multiplier using exponential scaling (0.5 to 2.0 range)
  // Low pressure connections become thinner, high pressure become thicker
  const pressureMultiplier = 0.5 + 1.5 * Math.pow(pressure, 2);

  // Combined width with clamping to reasonable range
  const combinedWidth = baseWidth * pressureMultiplier;

  // Clamp to reasonable range (0.1px to 4px)
  return Math.max(0.1, Math.min(4, combinedWidth));
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
 * Calculates the radius for a node based on its number of direct connections.
 * Nodes with more connections are larger for clear visual emphasis of network importance.
 * Supports both linear and logarithmic scaling for better visual distribution.
 *
 * @param connectionCount - Number of direct connections the node has
 * @param maxConnections - Maximum expected connections for normalization (defaults to 20)
 * @param useLogarithmic - Whether to use logarithmic scaling for better distribution (defaults to true)
 * @returns Node radius in pixels (5-11px range, 6px variation)
 */
export function getNodeRadius(
  connectionCount: number,
  maxConnections: number = 20,
  useLogarithmic: boolean = true
): number {
  const minRadius = 5;
  const maxRadius = 11;
  const radiusRange = maxRadius - minRadius;

  let normalizedCount: number;

  if (useLogarithmic && connectionCount > 0) {
    // Logarithmic scaling for better visual distribution
    // log(1) = 0, log(maxConnections) = max
    const logCount = Math.log(connectionCount + 1); // +1 to handle 0 connections
    const logMax = Math.log(maxConnections + 1);
    normalizedCount = Math.min(logCount / logMax, 1);
  } else {
    // Linear scaling
    normalizedCount = Math.min(connectionCount / maxConnections, 1);
  }

  // Map to radius range: 0 connections = 5px, max connections = 11px
  // This creates clear visual diversity (6px variation is very noticeable)
  return minRadius + normalizedCount * radiusRange;
}

/**
 * Checks if a node should have pulsing animation based on dynamic percentile thresholds.
 * Nodes above the 80th percentile will pulse with light green glow.
 *
 * @param volatility - Value between 0 and 1 representing market volatility
 * @param thresholds - Dynamic percentile thresholds
 * @returns Boolean indicating if node should pulse
 */
export function shouldNodePulseWithThresholds(
  volatility: number,
  thresholds: VolatilityThresholds
): boolean {
  return volatility >= thresholds.p80;
}

/**
 * Checks if a node should have pulsing animation based on volatility.
 * Nodes with volatility > 0.7 will pulse with light green glow.
 *
 * @param volatility - Value between 0 and 1 representing market volatility
 * @returns Boolean indicating if node should pulse
 * @deprecated Use shouldNodePulseWithThresholds for dynamic percentile-based pulsing
 */
export function shouldNodePulse(volatility: number): boolean {
  return volatility > 0.7;
}

/**
 * Configuration for connection opacity scaling
 */
export interface OpacityConfig {
  minOpacity: number; // Minimum opacity for lowest pressure
  maxOpacity: number; // Maximum opacity for highest pressure
  exponent: number; // Exponent for power scaling (higher = more dramatic)
}

/**
 * Default configuration for enhanced opacity scaling in cluster view
 */
export const DEFAULT_OPACITY_CONFIG: OpacityConfig = {
  minOpacity: 0.15, // Minimum opacity for low pressure (visible but faint)
  maxOpacity: 3.0, // Fully opaque for high pressure
  exponent: 2.5, // Power scaling for dramatic differences
};

/**
 * Maps a connection's pressure value directly to opacity using exponential scaling.
 * This provides more dramatic visual differences between similar pressure values.
 *
 * @param pressure - Value between 0 and 1 representing connection pressure
 * @param config - Optional configuration for opacity scaling
 * @returns Opacity value between minOpacity and maxOpacity
 */
export function getEnhancedConnectionOpacity(
  pressure: number,
  config: OpacityConfig = DEFAULT_OPACITY_CONFIG
): number {
  // Clamp pressure to 0-1 range
  const clampedPressure = Math.max(0, Math.min(1, pressure));

  // Apply exponential scaling for dramatic differences
  // Formula: opacity = minOpacity + (maxOpacity - minOpacity) * pressure^exponent
  const scaledValue = Math.pow(clampedPressure, config.exponent);
  const opacity =
    config.minOpacity + (config.maxOpacity - config.minOpacity) * scaledValue;

  // Ensure opacity is within valid range
  return Math.max(config.minOpacity, Math.min(config.maxOpacity, opacity));
}

/**
 * Maps a connection's pressure value to opacity based on dynamic percentile thresholds.
 * Uses exponential scaling within each tier for more dramatic visual differences.
 *
 * @param pressure - Value between 0 and 1 representing connection pressure
 * @param thresholds - Dynamic percentile thresholds for opacity mapping
 * @param config - Optional configuration for opacity scaling
 * @returns Opacity value with enhanced scaling
 */
export function getEnhancedConnectionOpacityByPressure(
  pressure: number,
  thresholds: PressureThresholds,
  config: OpacityConfig = DEFAULT_OPACITY_CONFIG
): number {
  // Normalize pressure to 0-1 range based on percentiles
  let normalizedPressure: number;

  if (pressure < thresholds.p40) {
    // Bottom 40% - map to 0-0.25 range
    normalizedPressure = (pressure / thresholds.p40) * 0.25;
  } else if (pressure < thresholds.p60) {
    // 40th to 60th percentile - map to 0.25-0.5 range
    const range = thresholds.p60 - thresholds.p40;
    if (range === 0) {
      normalizedPressure = 0.375;
    } else {
      const position = (pressure - thresholds.p40) / range;
      normalizedPressure = 0.25 + 0.25 * position;
    }
  } else if (pressure < thresholds.p80) {
    // 60th to 80th percentile - map to 0.5-0.75 range
    const range = thresholds.p80 - thresholds.p60;
    if (range === 0) {
      normalizedPressure = 0.625;
    } else {
      const position = (pressure - thresholds.p60) / range;
      normalizedPressure = 0.5 + 0.25 * position;
    }
  } else {
    // Top 20% - map to 0.75-1.0 range
    const range = thresholds.max - thresholds.p80;
    if (range === 0) {
      normalizedPressure = 1.0;
    } else {
      const position = Math.min((pressure - thresholds.p80) / range, 1);
      normalizedPressure = 0.75 + 0.25 * position;
    }
  }

  // Apply exponential scaling to the normalized value
  return getEnhancedConnectionOpacity(normalizedPressure, config);
}

/**
 * Maps a connection's pressure value to opacity based on dynamic percentile thresholds.
 * Opacity scale:
 * - Below 40th percentile: 0.2 (least opaque)
 * - 40th-60th percentile: 0.4
 * - 60th-80th percentile: 0.6
 * - Above 80th percentile: 0.9 (most opaque)
 *
 * Uses smooth interpolation between ranges for gradual transitions.
 *
 * @param pressure - Value between 0 and 1 representing connection pressure
 * @param thresholds - Dynamic percentile thresholds for opacity mapping
 * @returns Opacity value between 0.2 and 0.9
 * @deprecated Use getEnhancedConnectionOpacityByPressure for more dramatic visual differences
 */
export function getConnectionOpacityByPressure(
  pressure: number,
  thresholds: PressureThresholds
): number {
  // Bottom 40% - least opaque
  if (pressure < thresholds.p40) {
    return 0.2;
  }

  // 40th to 60th percentile - interpolate from 0.2 to 0.4
  if (pressure < thresholds.p60) {
    const range = thresholds.p60 - thresholds.p40;
    if (range === 0) return 0.3; // Avoid division by zero
    const position = (pressure - thresholds.p40) / range;
    return 0.2 + 0.2 * position; // Linear interpolation from 0.2 to 0.4
  }

  // 60th to 80th percentile - interpolate from 0.4 to 0.6
  if (pressure < thresholds.p80) {
    const range = thresholds.p80 - thresholds.p60;
    if (range === 0) return 0.5; // Avoid division by zero
    const position = (pressure - thresholds.p60) / range;
    return 0.4 + 0.2 * position; // Linear interpolation from 0.4 to 0.6
  }

  // Top 20% - interpolate from 0.6 to 0.9
  const range = thresholds.max - thresholds.p80;
  if (range === 0) return 0.9; // Avoid division by zero
  const position = Math.min((pressure - thresholds.p80) / range, 1); // Cap at 1
  return 0.6 + 0.3 * position; // Linear interpolation from 0.6 to 0.9
}
