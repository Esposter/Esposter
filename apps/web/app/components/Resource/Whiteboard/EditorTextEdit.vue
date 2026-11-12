<script setup lang="ts">
import type { PositionedElement } from "vue-block-editor-headless";

import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import {
  getTextPlacement,
  TEXT_FONT_FAMILY,
  TEXT_FONT_SIZE,
  TEXT_LINE_HEIGHT,
  TextAnchor,
} from "vue-block-editor-headless";

interface Props {
  element: PositionedElement;
}

// The text being edited in place, which is the only copy of the text while it is edited: the canvas leaves the element's own text out. It is
// Laid over the element where the text is drawn, at the text's font, size and wrap width scaled with the viewport, with no box of its own, so
// It reads as the text itself: centred on the placement point where the text is centred, and hanging from it where a text box's text starts.
// It takes focus as it opens, and a press or a double click in it is no gesture of the canvas
const draft = defineModel<string>({ required: true });
const { element } = defineProps<Props>();
const emit = defineEmits<{ blur: []; compositionEnd: []; compositionStart: []; keydown: [event: KeyboardEvent] }>();
const whiteboardEditorStore = useWhiteboardEditorStore();
const { viewport } = storeToRefs(whiteboardEditorStore);
const textarea = useTemplateRef("textarea");
const style = computed(() => {
  const placement = getTextPlacement(element);
  if (placement === undefined) return undefined;

  const { scale } = viewport.value;
  const isMiddle = placement.textAnchor === TextAnchor.Middle;
  return {
    background: "transparent",
    fieldSizing: "content",
    fontFamily: TEXT_FONT_FAMILY,
    fontSize: `${TEXT_FONT_SIZE * scale}px`,
    left: `${(placement.point.x - viewport.value.x) * scale}px`,
    lineHeight: `${TEXT_LINE_HEIGHT * scale}px`,
    textAlign: isMiddle ? "center" : "left",
    top: `${(placement.point.y - viewport.value.y) * scale}px`,
    transform: isMiddle ? "translate(-50%, -50%)" : undefined,
    width: `${placement.width * scale}px`,
  };
});
onMounted(() => {
  textarea.value?.focus();
});
</script>

<template>
  <textarea
    ref="textarea"
    v-model="draft"
    aria-label="Element text"
    rows="1"
    p-0
    outline-none
    of-hidden
    resize-none
    select-text
    text-text
    absolute
    :style
    @blur="emit('blur')"
    @compositionend="emit('compositionEnd')"
    @compositionstart="emit('compositionStart')"
    @dblclick.stop
    @keydown="(event) => emit('keydown', event)"
    @paste.stop
    @pointerdown.stop
  />
</template>
