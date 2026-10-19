// What a palette drag reads of the canvas's frame at each pointer move: the frame's box in the app's viewport, its scale,
// The node under the pointer, and each node's box in the frame's own viewport pixels, the space the pointer is mapped into
export interface FrameGeometry {
  frameRect: { height: number; left: number; top: number; width: number };
  getChildRect: (nodeId: string) => { height: number; left: number; top: number; width: number } | undefined;
  hoveredNodeId?: string;
  scale: number;
}
