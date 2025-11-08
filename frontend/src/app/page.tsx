// ABOUTME: Main page component displaying the trading network graph
// ABOUTME: Currently shows a loading state while the graph initializes

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-graph-bg">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-text-muted opacity-20"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-accent-blue"></div>
        </div>
        <p className="text-lg font-medium text-text-secondary">
          Loading graph...
        </p>
      </div>
    </div>
  );
}
