// What a bench of a scene measures: the time between each frame and the last, the renderer's own counts of a frame,
// What it keeps on the device, and the objects it draws by kind
export interface SceneBench {
  drawCalls: number;
  frameCalls: number;
  geometries: number;
  intervals: number[];
  kindCounts: Record<string, number>;
  programs: number;
  textures: number;
  triangles: number;
}
