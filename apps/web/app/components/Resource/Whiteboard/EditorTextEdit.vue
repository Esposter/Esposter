<script setup lang="ts">
import type { PositionedElement } from "vue-block-editor-headless";

import {
  WHITEBOARD_TEXT_EDIT_ANCHOR_MAP,
  WHITEBOARD_TEXT_EDIT_VERTICAL_SHIFT_MAP,
} from "@/services/whiteboard/text/constants";
import { getDraftPlacement } from "@/services/whiteboard/text/getDraftPlacement";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getTextLineHeight, TEXT_FONT_FAMILY } from "vue-block-editor-headless";

interface Props {
  element: PositionedElement;
}

// The text being edited in place, which is the only copy of the text while it is edited: the canvas leaves the element's own text out. It is
// Laid over the element where the text is drawn, in the layout the commit gives the text: its size, its alignment and its wrap, scaled with the viewport.
// An unwrapped text box is as wide as the draft's widest line, so it grows as the owner types. It has no box of its own, so it reads as the text itself,
// And it takes focus as it opens. A press or a double click in it is no gesture of the canvas
const draft = defineModel<string>({ required: true });
const { element } = defineProps<Props>();
const emit = defineEmits<{ blur: []; compositionEnd: []; compositionStart: []; keydown: [event: KeyboardEvent] }>();
const whiteboardEditorStore = useWhiteboardEditorStore();
const { viewport } = storeToRefs(whiteboardEditorStore);
const textarea = useTemplateRef("textarea");
const style = computed(() => {
  const placement = getDraftPlacement(element, draft.value);
  if (placement === undefined) return undefined;

  const { scale } = viewport.value;
  const { shift, textAlign } = WHITEBOARD_TEXT_EDIT_ANCHOR_MAP[placement.textAnchor];
  return {
    background: "transparent",
    fieldSizing: "content",
    fontFamily: TEXT_FONT_FAMILY,
    fontSize: `${placement.textSize * scale}px`,
    left: `${(placement.point.x - viewport.value.x) * scale}px`,
    lineHeight: `${getTextLineHeight(placement.textSize) * scale}px`,
    textAlign,
    top: `${(placement.point.y - viewport.value.y) * scale}px`,
    transform: `translate(${shift}, ${WHITEBOARD_TEXT_EDIT_VERTICAL_SHIFT_MAP[placement.verticalAlignment]})`,
    whiteSpace: placement.isWrapped ? undefined : "pre",
    // An unwrapped draft is sized by its own text, so a glyph wider than the estimate is never clipped while it is typed
    width: placement.isWrapped ? `${placement.width * scale}px` : undefined,
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
