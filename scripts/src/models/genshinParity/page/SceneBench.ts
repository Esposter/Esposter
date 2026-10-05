// What the page's `benchScene` hands back: the time between frames, and the renderer's counts a frame and on the device
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
