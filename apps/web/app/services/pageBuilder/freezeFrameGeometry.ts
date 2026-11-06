import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { checkIsInsideBox } from "@/services/pageBuilder/checkIsInsideBox";

// The frame's node boxes as they stood when a drag began, before the drag's own preview moved any of them. The preview is
// Drawn in the frame and pushes the nodes after it along, and whatever the pointer then resolves reads those pushed boxes, so
// A pointer held still would flip between two slots with every redraw. A frozen frame answers every move from the boxes that
// Stood before the preview, moved by what the frame has scrolled since, and finds the node under a point from those boxes
export const freezeFrameGeometry = (geometry: FrameGeometry, nodeIds: readonly string[]): FrameGeometry => {
  const startScrollTop = geometry.getScrollTop?.() ?? 0;
  const startRects = new Map<string, OverlayBox>();
  for (const nodeId of nodeIds) {
    const rect = geometry.getChildRect(nodeId);
    // A browser's rect holds its sides as getters on its prototype, which a spread does not copy, so the box is built out of them
    if (rect) startRects.set(nodeId, { height: rect.height, left: rect.left, top: rect.top, width: rect.width });
  }
  const getChildRect = (nodeId: string): OverlayBox | undefined => {
    const rect = startRects.get(nodeId);
    return rect && { ...rect, top: rect.top - ((geometry.getScrollTop?.() ?? 0) - startScrollTop) };
  };

  return {
    ...geometry,
    getChildRect,
    // The smallest box holding the point is the innermost node, and of two equal boxes the one later in document order
    getNodeIdAt: (point) => {
      let innermost: undefined | { area: number; nodeId: string };
      for (const nodeId of startRects.keys()) {
        const rect = getChildRect(nodeId);
        if (!checkIsInsideBox(point, rect) || !rect) continue;

        const area = rect.width * rect.height;
        if (!innermost || area <= innermost.area) innermost = { area, nodeId };
      }
      return innermost?.nodeId;
    },
  };
};
