// ABOUTME: Utility functions for the application
// ABOUTME: Includes className merging and other helper functions

import { clsx, type ClassValue } from "clsx";

/**
 * Merges className strings using clsx
 * Handles conditional classes and removes duplicates
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
