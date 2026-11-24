import type { OverlayBox } from "#src/models/pageBuilder/OverlayBox";

// What a palette drag reads of the canvas's frame at each pointer move: the frame's box in the app's viewport, its
// Scale, the node under a point in the frame's own pixels, each node's box in those same pixels, the space the pointer
// Is mapped into, and whether a node's children run across a row, which is the axis a drop into its slot
// Resolves along. A frame that can scroll also takes a delta in its own pixels, which a drag at its edge scrolls it by
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
