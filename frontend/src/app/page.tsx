// ABOUTME: Main page component displaying the trading network graph
// ABOUTME: Loads graph data and renders the force-directed visualization

import { ForceGraph } from "@/components/ForceGraph/ForceGraph";
import { isGraphData } from "@/types/graph";

// API-TODO: Replace with GET /api/graph/data endpoint when backend is ready
// API-TODO: This mock data import should be replaced with a fetch call to the backend API
// API-TODO: Example: const response = await fetch('/api/graph/data'); const data = await response.json();
import graphDataJson from "@/data/sample-100-nodes.json";
import type { GraphData } from "@/types/graph";

const graphData = graphDataJson as GraphData;

export default function Home() {
  // Validate data structure at runtime
  if (!isGraphData(graphData)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-graph-bg">
        <div className="rounded-lg bg-accent-red/10 border border-accent-red px-8 py-6">
          <p className="text-lg font-medium text-accent-red">
            Error: Invalid graph data structure
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-graph-bg">
      <ForceGraph data={graphData} />
    </div>
  );
}
