import type { ArrowEnd, Point } from "vue-block-editor-headless";

import { takeOne } from "@esposter/shared";

// An arrow end of a copy, moved by the offset. It stays bound to the copy of the shape it was bound to, when that shape is copied with it, and is free otherwise
export const getDuplicateArrowEnd = (
  arrowEnd: ArrowEnd,
  originalIdCopyIdMap: Record<string, string>,
  offset: Point,
): ArrowEnd => {
  const { arrowhead, binding, point } = arrowEnd;
  const copiedPoint = { x: point.x + offset.x, y: point.y + offset.y };
  const copiedEnd = arrowhead === undefined ? { point: copiedPoint } : { arrowhead, point: copiedPoint };
  if (binding === undefined || !Object.hasOwn(originalIdCopyIdMap, binding.elementId)) return copiedEnd;

  return { ...copiedEnd, binding: { ...binding, elementId: takeOne(originalIdCopyIdMap, binding.elementId) } };
};
