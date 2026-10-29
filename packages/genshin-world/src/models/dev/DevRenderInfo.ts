// The counters a renderer keeps for the frame it last drew: the draw calls it sent and the triangles those drew
export interface DevRenderInfo {
  render: { calls: number; triangles: number };
}
