<script setup lang="ts">
import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";
import type { Point } from "headless-block-editor";

import { createWhiteboardElement } from "@/services/whiteboard/createWhiteboardElement";
import { WHITEBOARD_PALETTE_GROUPS } from "@/services/whiteboard/palette/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { GRID_SIZE, snapToGrid } from "headless-block-editor";

// The things a whiteboard places. A click places one at the middle of the canvas, and a drag places it where the pointer is let go
// Over the canvas, so nothing is placed by a drop that lands on the palette or the page around the canvas. With snap on, it is placed on the grid
const whiteboardStore = useWhiteboardStore();
const { insertElement } = whiteboardStore;
const whiteboardEditorStore = useWhiteboardEditorStore();
const { checkIsInCanvas, getCentrePoint, getDocumentPoint } = whiteboardEditorStore;
const { isSnapEnabled } = storeToRefs(whiteboardEditorStore);
const placeAt = (item: WhiteboardPaletteItem, point: Point) => {
  const centre = isSnapEnabled.value ? { x: snapToGrid(point.x, GRID_SIZE), y: snapToGrid(point.y, GRID_SIZE) } : point;
  insertElement(createWhiteboardElement(item, centre));
};
</script>

<template>
  <div p-2 flex flex-col gap-3 of-y-auto ui-lifted>
    <section v-for="{ items, title } in WHITEBOARD_PALETTE_GROUPS" :key="title" flex flex-col gap-1>
      <h3 text-muted ui-title>{{ title }}</h3>
      <div flex flex-col gap-1>
        <ResourceWhiteboardEditorPaletteItem
          v-for="item in items"
          :key="item.title"
          :item
          @drop="
            (point) => {
              if (checkIsInCanvas(point)) placeAt(item, getDocumentPoint(point));
            }
          "
          @place="placeAt(item, getCentrePoint())"
        />
      </div>
    </section>
  </div>
</template>
