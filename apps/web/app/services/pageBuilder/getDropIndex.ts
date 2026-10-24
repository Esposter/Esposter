import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// The index a drop inserts at: the first child whose midpoint along the slot's axis the pointer has not crossed
export const getDropIndex = (
  childRects: (OverlayBox | undefined)[],
  pointer: { x: number; y: number },
  isHorizontal: boolean,
): number => {
  const index = childRects.findIndex((rect) => {
    if (!rect) return false;

    return isHorizontal ? pointer.x < rect.left + rect.width / 2 : pointer.y < rect.top + rect.height / 2;
  });
  return index === -1 ? childRects.length : index;
};
