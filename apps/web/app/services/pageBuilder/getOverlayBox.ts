import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// An element's box placed inside the frame's body, from the viewport rects both are measured in. The size is the element's own
export const getOverlayBox = (
  elementRect: Pick<OverlayBox, "height" | "left" | "top" | "width">,
  bodyRect: Pick<OverlayBox, "left" | "top">,
): OverlayBox => ({
  height: elementRect.height,
  left: elementRect.left - bodyRect.left,
  top: elementRect.top - bodyRect.top,
  width: elementRect.width,
});
