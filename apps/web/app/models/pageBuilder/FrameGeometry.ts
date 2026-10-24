import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// What a palette drag reads of the canvas's frame at each pointer move: the frame's box in the app's viewport, its scale,
// The node under the pointer, each node's box in the frame's own viewport pixels, the space the pointer is mapped into,
// And whether a node's children run across a row, which is the axis a drop into its slot resolves along
export interface FrameGeometry {
  checkIsHorizontalOwner: (ownerId: string) => boolean;
  frameRect: OverlayBox;
  getChildRect: (nodeId: string) => OverlayBox | undefined;
  hoveredNodeId?: string;
  scale: number;
}
