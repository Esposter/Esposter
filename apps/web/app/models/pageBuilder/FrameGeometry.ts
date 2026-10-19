import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// What a palette drag reads of the canvas's frame at each pointer move: the frame's box in the app's viewport, its scale,
// The node under the pointer, and each node's box in the frame's own viewport pixels, the space the pointer is mapped into
export interface FrameGeometry {
  frameRect: OverlayBox;
  getChildRect: (nodeId: string) => OverlayBox | undefined;
  hoveredNodeId?: string;
  scale: number;
}
