import type { GridItem } from "#src/models/GridItem";

import { findGridAt } from "#src/services/mountedGrids";

// An item from outside every grid, such as a palette entry, is dragged by its element: the release lands it on the grid under
// The pointer, and a release over no grid drops it
export const startExternalDrag = (event: PointerEvent, item: Pick<GridItem, "h" | "id" | "w">): void => {
  if (!(event.currentTarget instanceof HTMLElement)) return;

  const element = event.currentTarget;
  const { pointerId } = event;
  element.setPointerCapture(pointerId);
  // A cancelled press never releases, so the listeners end on either pointer event rather than on the release alone
  const controller = new AbortController();
  const { signal } = controller;
  element.addEventListener(
    "pointerup",
    (releaseEvent) => {
      if (releaseEvent.pointerId !== pointerId) return;

      controller.abort();
      const point = { x: releaseEvent.clientX, y: releaseEvent.clientY };
      findGridAt(point)?.accept(item, point);
    },
    { signal },
  );
  element.addEventListener(
    "pointercancel",
    (cancelEvent) => {
      if (cancelEvent.pointerId === pointerId) controller.abort();
    },
    { signal },
  );
};
