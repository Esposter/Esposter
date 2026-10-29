import { DRAG_AUTOSCROLL_EDGE } from "@/services/ui/constants";

// The innermost scroller the pointer is near the top or bottom edge of, or past it, that can still scroll that way,
// And how fast as a share of the full speed. Its edge is where it is seen, so one running past the window's edge
// Scrolls from the window's
export const getAutoscroll = (scrollers: Element[], pointerY: number) => {
  for (const scroller of scrollers) {
    const { bottom, top } =
      scroller === window.document.scrollingElement
        ? { bottom: window.innerHeight, top: 0 }
        : scroller.getBoundingClientRect();
    const upDepth = Math.max(top, 0) + DRAG_AUTOSCROLL_EDGE - pointerY;
    if (upDepth > 0 && scroller.scrollTop > 0) return { scroller, speed: -Math.min(upDepth / DRAG_AUTOSCROLL_EDGE, 1) };
    const downDepth = pointerY - Math.min(bottom, window.innerHeight) + DRAG_AUTOSCROLL_EDGE;
    // A scroller at its end can land a fraction of a pixel short of it
    if (downDepth > 0 && scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1)
      return { scroller, speed: Math.min(downDepth / DRAG_AUTOSCROLL_EDGE, 1) };
  }
  return undefined;
};
