<script setup lang="ts">
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";
import type { Point } from "vue-block-editor-headless";

import { useInsertWhiteboardImages } from "@/composables/whiteboard/useInsertWhiteboardImages";
import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { GRID_SIZE } from "vue-block-editor-headless";

// The canvas draws the document in z-order under its viewport, or the preview of the gesture in progress in its place. Its overlay slot is drawn
// Over the elements in the document's coordinates, and its html slot over the page, for whatever a gesture or a text edit shows while it lasts.
// Each pointer event leaves as a gesture event, in screen pixels from the canvas's top left, so the gesture reducer reads the canvas and no DOM
defineSlots<{ html?: () => VNode; overlay?: () => VNode }>();
const emit = defineEmits<{ doubleClick: [screen: Point]; pointer: [event: GesturePointerEvent] }>();
const canvas = useTemplateRef("canvas");
const { height, width, x, y } = useElementBounding(canvas);
const whiteboardStore = useWhiteboardStore();
const { displayedDocument } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { setCanvasRect } = whiteboardEditorStore;
const { viewport } = storeToRefs(whiteboardEditorStore);
const insertImages = useInsertWhiteboardImages();
const transform = computed(
  () =>
    `translate(${-viewport.value.x * viewport.value.scale} ${-viewport.value.y * viewport.value.scale}) scale(${viewport.value.scale})`,
);
watch([height, width, x, y], ([newHeight, newWidth, newX, newY]) => {
  setCanvasRect({ height: newHeight, width: newWidth, x: newX, y: newY });
});
const getScreenPoint = (event: MouseEvent): Point => ({ x: event.clientX - x.value, y: event.clientY - y.value });
const emitPointer = (action: GesturePointerAction, event: PointerEvent) => {
  emit("pointer", {
    action,
    button: event.button,
    isShiftKey: event.shiftKey,
    pointerId: event.pointerId,
    screen: getScreenPoint(event),
  });
};
</script>

<template>
  <div
    ref="canvas"
    h-full
    w-full
    relative
    of-hidden
    tabindex="0"
    role="application"
    aria-label="Whiteboard"
    @pointerdown="
      (event) => {
        canvas?.setPointerCapture(event.pointerId);
        emitPointer(GesturePointerAction.Down, event);
      }
    "
    @pointermove="(event) => emitPointer(GesturePointerAction.Move, event)"
    @pointerup="(event) => emitPointer(GesturePointerAction.Up, event)"
    @pointercancel="(event) => emitPointer(GesturePointerAction.Cancel, event)"
    @dblclick="(event) => emit('doubleClick', getScreenPoint(event))"
    @paste="(event) => insertImages([...(event.clipboardData?.files ?? [])])"
  >
    <svg text-text size-full block>
      <defs>
        <pattern
          id="whiteboard-grid"
          :width="GRID_SIZE"
          :height="GRID_SIZE"
          x="-1.5"
          y="-1.5"
          patternUnits="userSpaceOnUse"
          text-muted
        >
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <g :transform>
        <rect
          :x="viewport.x"
          :y="viewport.y"
          :width="width / viewport.scale"
          :height="height / viewport.scale"
          fill="url(#whiteboard-grid)"
        />
        <ResourceWhiteboardElement v-for="element in displayedDocument.elements" :key="element.id" :element />
        <slot name="overlay" />
      </g>
    </svg>
    <slot name="html" />
  </div>
</template>
