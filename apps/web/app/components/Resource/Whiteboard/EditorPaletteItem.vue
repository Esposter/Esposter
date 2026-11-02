<script setup lang="ts">
import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";
import type { Point } from "headless-block-editor";

import { DRAG_START_DISTANCE } from "@/services/ui/constants";
import { createWhiteboardElement } from "@/services/whiteboard/createWhiteboardElement";
import { PRIMARY_BUTTON } from "@/services/whiteboard/gesture/constants";
import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { WHITEBOARD_PALETTE_PREVIEW_PADDING } from "@/services/whiteboard/palette/constants";
import { getWhiteboardItemSize } from "@/services/whiteboard/palette/getWhiteboardItemSize";

interface Props {
  item: WhiteboardPaletteItem;
}

// One thing the palette places, drawn as it will be placed. A press that moves past the drag start distance is a drag, which
// Ends as a drop at the point the pointer is let go; a press that does not move is a click, which places it. The pointer is
// Captured on press, so the release reaches the item wherever it lands
const { item } = defineProps<Props>();
const emit = defineEmits<{ drop: [point: Point]; place: [] }>();
const button = useTemplateRef("button");
const size = getWhiteboardItemSize(item);
const previewElement = createWhiteboardElement(item, { x: size.width / 2, y: size.height / 2 });
const padding = WHITEBOARD_PALETTE_PREVIEW_PADDING;
const previewViewBox = `${-padding} ${-padding} ${size.width + padding * 2} ${size.height + padding * 2}`;
// The press a drag is measured from, and whether the press has moved far enough to be one. Neither is shown, so neither is reactive
let pressedAt: Point | undefined;
let isDragged = false;
const onPointerDown = (event: PointerEvent) => {
  if (event.button !== PRIMARY_BUTTON) return;
  pressedAt = { x: event.clientX, y: event.clientY };
  isDragged = false;
  button.value?.setPointerCapture(event.pointerId);
};
const onPointerMove = (event: PointerEvent) => {
  if (pressedAt === undefined) return;
  if (getPointDistance(pressedAt, { x: event.clientX, y: event.clientY }) > DRAG_START_DISTANCE) isDragged = true;
};
const onPointerUp = (event: PointerEvent) => {
  if (pressedAt === undefined) return;
  pressedAt = undefined;
  if (isDragged) emit("drop", { x: event.clientX, y: event.clientY });
};
const onPointerCancel = () => {
  pressedAt = undefined;
  isDragged = false;
};
// The release of a drag is also a click, which a drag has already acted on, so the click that follows one is ignored
const onClick = () => {
  if (isDragged) {
    isDragged = false;
    return;
  }
  emit("place");
};
</script>

<template>
  <UiTooltip #default="{ activatorProps }" :label="item.title">
    <button
      ref="button"
      :="activatorProps"
      type="button"
      ui-button
      p-1
      :aria-label="item.title"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @click="onClick"
    >
      <svg block size-12 text-text :viewBox="previewViewBox">
        <ResourceWhiteboardElement :element="previewElement" />
      </svg>
    </button>
  </UiTooltip>
</template>
