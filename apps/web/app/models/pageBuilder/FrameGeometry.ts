import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// What a palette drag reads of the canvas's frame at each pointer move: the frame's box in the app's viewport, its scale,
// The node under a point in the frame's own pixels, each node's box in those same pixels, the space the pointer is mapped
// Into, and whether a node's children run across a row, which is the axis a drop into its slot resolves along. A frame that
// can scroll also takes a delta in its own pixels, which a drag at its edge scrolls it by
export interface FrameGeometry {
  checkIsHorizontalOwner: (ownerId: string) => boolean;
  frameRect: OverlayBox;
  getChildRect: (nodeId: string) => OverlayBox | undefined;
  getNodeIdAt: (point: { x: number; y: number }) => string | undefined;
  // How far the frame has scrolled, in its own pixels, which a frozen frame moves its boxes by
  getScrollTop?: () => number;
  scale: number;
  scrollBy?: (delta: number) => void;
}
