import { DRAG_AUTOSCROLL_EDGE, DRAG_AUTOSCROLL_SPEED } from "@/services/ui/constants";

// How fast a drag scrolls its frame, in viewport pixels a millisecond, from how deep the pointer is in the band at either
// End of the frame: negative toward its top, positive toward its bottom, and zero between them. Past an end, full speed
export const getEdgeScrollVelocity = (pointerY: number, frameRect: { height: number; top: number }) => {
  const upDepth = frameRect.top + DRAG_AUTOSCROLL_EDGE - pointerY;
  if (upDepth > 0) return -Math.min(upDepth / DRAG_AUTOSCROLL_EDGE, 1) * DRAG_AUTOSCROLL_SPEED;

  const downDepth = pointerY - (frameRect.top + frameRect.height) + DRAG_AUTOSCROLL_EDGE;
  return downDepth > 0 ? Math.min(downDepth / DRAG_AUTOSCROLL_EDGE, 1) * DRAG_AUTOSCROLL_SPEED : 0;
};
