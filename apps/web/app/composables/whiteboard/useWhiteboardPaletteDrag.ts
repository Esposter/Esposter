import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";
import type { Point } from "headless-block-editor";

import { DRAG_START_DISTANCE, LONG_PRESS_MOVE_TOLERANCE, TOUCH_DRAG_DELAY_MS } from "@/services/ui/constants";
import { holdPageStillWhile } from "@/services/ui/holdPageStillWhile";
import { swallowNextWindowClick } from "@/services/ui/swallowNextWindowClick";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { getWhiteboardPaletteKind } from "@/services/whiteboard/palette/getWhiteboardPaletteKind";
import { WhiteboardPaletteIconMap } from "@/services/whiteboard/palette/WhiteboardPaletteIconMap";

// A palette item dragged onto the canvas. A press that moves past the drag start distance is a drag, whose ghost follows
// The pointer until the release, which hands the item and the point it was let go at to `onRelease`. A finger drags only
// Once it has rested for the touch delay, and a finger that moves before then is scrolling, so the press ends and the page
// Scrolls. Escape cancels a drag. A press that never becomes a drag is a click, which the palette's own button handles
export const useWhiteboardPaletteDrag = (onRelease: (item: WhiteboardPaletteItem, point: Point) => void) => {
  const ghost = shallowRef<{ icon: UiIconMeaning; point: Point; title: string }>();
  let abortController: AbortController | undefined;
  const endDrag = () => {
    abortController?.abort();
    abortController = undefined;
    ghost.value = undefined;
  };
  tryOnScopeDispose(endDrag);
  const startDrag = (item: WhiteboardPaletteItem, event: PointerEvent) => {
    endDrag();
    const controller = new AbortController();
    abortController = controller;
    const { signal } = controller;
    const { clientX, clientY, pointerId, pointerType } = event;
    const pressedAt: Point = { x: clientX, y: clientY };
    const isTouch = pointerType === "touch";
    const icon = WhiteboardPaletteIconMap[getWhiteboardPaletteKind(item)];
    let isRested = !isTouch;
    let isDragging = false;
    if (isTouch)
      setTimeout(() => {
        isRested = true;
      }, TOUCH_DRAG_DELAY_MS);
    const onPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const point = { x: moveEvent.clientX, y: moveEvent.clientY };
      if (!isDragging) {
        const distance = getPointDistance(pressedAt, point);
        if (!isRested && distance > LONG_PRESS_MOVE_TOLERANCE) {
          endDrag();
          return;
        }
        if (!isRested || distance < DRAG_START_DISTANCE) return;
        isDragging = true;
      }
      ghost.value = { icon, point, title: item.title };
    };
    const onPointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerId) return;
      if (isDragging) {
        onRelease(item, { x: upEvent.clientX, y: upEvent.clientY });
        swallowNextWindowClick();
      }
      endDrag();
    };
    const onKeydown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key !== "Escape" || !isDragging) return;
      keyEvent.preventDefault();
      keyEvent.stopPropagation();
      endDrag();
    };
    window.addEventListener("pointermove", onPointerMove, { signal });
    window.addEventListener("pointerup", onPointerUp, { signal });
    window.addEventListener("pointercancel", endDrag, { signal });
    window.addEventListener("keydown", onKeydown, { capture: true, signal });
    if (isTouch) holdPageStillWhile(() => isDragging, signal);
  };

  return { ghost, startDrag };
};
