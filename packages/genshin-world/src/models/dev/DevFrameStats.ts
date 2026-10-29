// What the stats overlay shows: the median frame time over the last frames, in milliseconds, and the draw calls and
// Triangles of the last frame drawn
export interface DevFrameStats {
  drawCalls: number;
  frameMilliseconds: number;
  triangles: number;
}
