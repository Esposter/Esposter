import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { checkIsSameLine } from "@/services/pageBuilder/checkIsSameLine";

// Along a row that wraps, the pointer's line is the first child whose bottom the pointer has not passed.
// The drop lands before the first child on that line whose midpoint the pointer has not crossed,
// Or after the line's last child
const getHorizontalDropIndex = (childRects: (OverlayBox | undefined)[], pointer: { x: number; y: number }): number => {
  const lineStart = childRects.findIndex((rect) => rect !== undefined && pointer.y <= rect.top + rect.height);
  const line = childRects[lineStart];
  if (line === undefined) return childRects.length;
  // A taller child on the line can put the pointer past a shorter one's bottom, so the line starts at its first child
  const firstOnLine = childRects.findIndex((rect) => rect !== undefined && checkIsSameLine(rect, line));
  const lineChildren = childRects.flatMap((rect, index) =>
    rect !== undefined && index >= firstOnLine && checkIsSameLine(rect, line) ? [{ index, rect }] : [],
  );
  const crossed = lineChildren.find(({ rect }) => pointer.x < rect.left + rect.width / 2);
  return crossed?.index ?? (lineChildren.at(-1)?.index ?? lineStart) + 1;
};
// In a stack the pointer resolves by its height, the first child whose midpoint it has not crossed
const getVerticalDropIndex = (childRects: (OverlayBox | undefined)[], pointer: { x: number; y: number }): number => {
  const index = childRects.findIndex((rect) => rect !== undefined && pointer.y < rect.top + rect.height / 2);
  return index === -1 ? childRects.length : index;
};
// The index a drop inserts at: the child the pointer resolves to along the slot's axis, or past the last child
export const getDropIndex = (
  childRects: (OverlayBox | undefined)[],
  pointer: { x: number; y: number },
  isHorizontal: boolean,
): number => (isHorizontal ? getHorizontalDropIndex(childRects, pointer) : getVerticalDropIndex(childRects, pointer));
