import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// Whether a point lies in a box, its edges included. A node with no rect in the frame holds no point
export const checkIsInsideBox = (point: { x: number; y: number }, box: OverlayBox | undefined) =>
  box !== undefined &&
  point.x >= box.left &&
  point.x <= box.left + box.width &&
  point.y >= box.top &&
  point.y <= box.top + box.height;
