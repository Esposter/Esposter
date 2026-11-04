import type { GridCell } from "#src/models/GridCell";
import type { GridItem } from "#src/models/GridItem";
import type { MountedGrid } from "#src/models/MountedGrid";

import { findGridAt } from "#src/services/findGridAt";

// An item from outside every grid, such as a palette entry, is dragged by its element: the grid under the pointer previews the
// Cell the item would land on, and the release drops it there, or nowhere when no grid takes it. The drop receives the grid's
// Root too, so a consumer reads its own data attribute from it to know which group the item landed in
export const startExternalDrag = (
  event: PointerEvent,
  item: GridItem,
  onDrop: (cell: GridCell, target: HTMLElement) => void,
): void => {
  // Only the primary button starts a drag, since a touch or pen contact reports button 0 too
  if (event.button !== 0) return;
  if (!(event.currentTarget instanceof HTMLElement)) return;

  const element = event.currentTarget;
  const { pointerId } = event;
  element.setPointerCapture(pointerId);
  // A cancelled press never releases, so the listeners end on either pointer event rather than on the release alone
  const controller = new AbortController();
  const { signal } = controller;
  // The grid the pointer was over last, so a move onto another grid clears the preview it left behind
  let lastGrid: MountedGrid | undefined;
  element.addEventListener(
    "pointermove",
    (moveEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      const point = { x: moveEvent.clientX, y: moveEvent.clientY };
      const grid = findGridAt(point, element);
      if (grid !== lastGrid) {
        lastGrid?.clearPreview();
        lastGrid = grid;
      }
      grid?.preview(item, point);
    },
    { signal },
  );
  element.addEventListener(
    "pointerup",
    (releaseEvent) => {
      if (releaseEvent.pointerId !== pointerId) return;

      controller.abort();
      lastGrid?.clearPreview();
      const point = { x: releaseEvent.clientX, y: releaseEvent.clientY };
      const grid = findGridAt(point, element);
      const cell = grid?.accept(item, point);
      if (grid && cell) onDrop(cell, grid.element);
    },
    { signal },
  );
  element.addEventListener(
    "pointercancel",
    (cancelEvent) => {
      if (cancelEvent.pointerId !== pointerId) return;

      controller.abort();
      lastGrid?.clearPreview();
    },
    { signal },
  );
};
