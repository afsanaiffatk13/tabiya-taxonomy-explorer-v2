/**
 * Legend explaining the visual encoding of the network graph
 */
export function NetworkLegend() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-xs text-text-muted mt-3">
      {/* Node types */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#002147' }} />
          <span>Occupation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#26B87D' }} />
          <span>Skill</span>
        </div>
      </div>

      {/* Distance indicator */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400">|</span>
        <span>Larger nodes = closer to center</span>
      </div>

      {/* Interaction hints */}
      <div className="text-gray-500 ml-auto">
        Click to explore | Hover for details
      </div>
    </div>
  );
}
