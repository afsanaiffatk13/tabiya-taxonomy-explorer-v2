/**
 * Legend explaining the visual encoding of the network graph
 */
export function NetworkLegend() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-xs text-text-muted mt-4">
      {/* Node types */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-oxford-blue">Nodes:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-soft-green border-2 border-green-3" />
          <span>Occupation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-light-green border-2 border-green-2" />
          <span>Skill</span>
        </div>
      </div>

      {/* Edge types */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-oxford-blue">Connections:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-green-3" />
          <span>Essential</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-6 h-0.5"
            style={{
              background:
                'repeating-linear-gradient(90deg, #9CA3AF 0, #9CA3AF 4px, transparent 4px, transparent 8px)',
            }}
          />
          <span>Optional</span>
        </div>
      </div>

      {/* Distance explanation */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-oxford-blue">Distance:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-soft-green border-2 border-green-3 opacity-100" />
          <span>Connected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300 opacity-40" />
          <span>2 hops</span>
        </div>
      </div>

      {/* Interaction hints */}
      <div className="text-gray-500 ml-auto">
        Click node to explore  |  Scroll to zoom  |  Drag to pan
      </div>
    </div>
  );
}
