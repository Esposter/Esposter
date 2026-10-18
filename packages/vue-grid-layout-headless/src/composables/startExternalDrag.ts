import type { GridItem } from "#src/models/GridItem";

import { findGridAt } from "#src/services/mountedGrids";

// An item from outside every grid, such as a palette entry, is dragged by its element: the release lands it on the grid under
// The pointer, and a release over no grid drops it
export const startExternalDrag = (event: PointerEvent, item: Pick<GridItem, "h" | "id" | "w">): void => {
  if (!(event.currentTarget instanceof HTMLElement)) return;

  const element = event.currentTarget;
  const { pointerId } = event;
  element.setPointerCapture(pointerId);
  const handlePointerUp = (releaseEvent: PointerEvent) => {
    if (releaseEvent.pointerId !== pointerId) return;

    element.removeEventListener("pointerup", handlePointerUp);
    const point = { x: releaseEvent.clientX, y: releaseEvent.clientY };
    findGridAt(point)?.accept(item, point);
  };
  element.addEventListener("pointerup", handlePointerUp);
};
