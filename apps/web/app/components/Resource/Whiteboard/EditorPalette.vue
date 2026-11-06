<script setup lang="ts">
import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";
import type { Point } from "headless-block-editor";

import { useWhiteboardPaletteDrag } from "@/composables/whiteboard/useWhiteboardPaletteDrag";
import { createWhiteboardElement } from "@/services/whiteboard/createWhiteboardElement";
import { getSnappedPoint } from "@/services/whiteboard/gesture/getSnappedPoint";
import { getPlacedBounds } from "@/services/whiteboard/getPlacedBounds";
import { getWhiteboardPaletteGroups } from "@/services/whiteboard/palette/getWhiteboardPaletteGroups";
import { getWhiteboardPaletteItem } from "@/services/whiteboard/palette/getWhiteboardPaletteItem";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// The things a whiteboard places. A click places one at the middle of the canvas, and a drag places it where the pointer is let go
// Over the canvas, so nothing is placed by a drop that lands on the palette or the page around the canvas. With snap on, it is placed on the grid
const whiteboardStore = useWhiteboardStore();
const { insertElement } = whiteboardStore;
const whiteboardEditorStore = useWhiteboardEditorStore();
const { checkIsInCanvas, getCentrePoint, getDocumentPoint } = whiteboardEditorStore;
const { isSnapEnabled } = storeToRefs(whiteboardEditorStore);
const placeAt = (item: WhiteboardPaletteItem, point: Point) => {
  const centre = getSnappedPoint(point, isSnapEnabled.value);
  const placedBounds = getPlacedBounds(item, centre);
  const id = crypto.randomUUID();
  insertElement(createWhiteboardElement(item, id, placedBounds));
};
const { ghost, startDrag } = useWhiteboardPaletteDrag((item, point) => {
  if (checkIsInCanvas(point)) placeAt(item, getDocumentPoint(point));
});
const paletteGroups = getWhiteboardPaletteGroups();
const insert = (kind: string) => {
  const item = getWhiteboardPaletteItem(kind);
  if (item !== undefined) placeAt(item, getCentrePoint());
};
const dragStart = (kind: string, event: PointerEvent) => {
  const item = getWhiteboardPaletteItem(kind);
  if (item !== undefined) startDrag(item, event);
};
</script>

<template>
  <div p-2 flex flex-col of-y-auto ui-lifted>
    <UiPalette :groups="paletteGroups" @insert="insert" @drag-start="dragStart" />
    <UiDragGhost v-if="ghost" :icon="ghost.icon" :point="ghost.point" :title="ghost.title" />
  </div>
</template>
