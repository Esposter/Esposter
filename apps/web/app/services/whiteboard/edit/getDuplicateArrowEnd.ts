import type { ArrowEnd } from "vue-block-editor-headless";

import { WHITEBOARD_DUPLICATE_OFFSET } from "@/services/whiteboard/edit/constants";
import { takeOne } from "@esposter/shared";

// An arrow end of a copy, moved by the duplicate offset. It stays bound to the copy of the shape it was bound to, when that shape is copied with it, and is free otherwise
export const getDuplicateArrowEnd = (arrowEnd: ArrowEnd, originalIdCopyIdMap: Record<string, string>): ArrowEnd => {
  const { binding, hasArrowhead, point } = arrowEnd;
  const copiedPoint = { x: point.x + WHITEBOARD_DUPLICATE_OFFSET, y: point.y + WHITEBOARD_DUPLICATE_OFFSET };
  if (binding === undefined || !Object.hasOwn(originalIdCopyIdMap, binding.elementId))
    return { hasArrowhead, point: copiedPoint };

  return {
    binding: { ...binding, elementId: takeOne(originalIdCopyIdMap, binding.elementId) },
    hasArrowhead,
    point: copiedPoint,
  };
};
