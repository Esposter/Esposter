import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";
import type { Point } from "headless-block-editor";

import { getWhiteboardPaletteKind } from "@/services/whiteboard/palette/getWhiteboardPaletteKind";
import { WhiteboardPaletteIconMap } from "@/services/whiteboard/palette/WhiteboardPaletteIconMap";

// A palette item dragged onto the canvas, whose ghost follows the pointer until the release, which hands the item and the
// Point it was let go at to `onRelease`. The press is the shared one: a click until it moves, a finger dragging only once it
// Has rested, and Escape cancelling. A press that never becomes a drag is a click, which the palette's own button handles
export const useWhiteboardPaletteDrag = (onRelease: (item: WhiteboardPaletteItem, point: Point) => void) => {
  const { isDragging, point, startPress } = usePressDrag();
  const draggedItem = shallowRef<WhiteboardPaletteItem>();
  const ghost = computed<{ icon: UiIconMeaning; point: Point; title: string } | undefined>(() => {
    const item = draggedItem.value;
    return item && isDragging.value && point.value
      ? { icon: WhiteboardPaletteIconMap[getWhiteboardPaletteKind(item)], point: point.value, title: item.title }
      : undefined;
  });
  const startDrag = (item: WhiteboardPaletteItem, event: PointerEvent) => {
    // Set after the press starts, since starting it ends a live press whose end clears the item
    startPress(event, {
      onEnd: () => {
        draggedItem.value = undefined;
      },
      onRelease: (releasePoint) => {
        onRelease(item, releasePoint);
      },
    });
    draggedItem.value = item;
  };

  return { ghost, startDrag };
};
