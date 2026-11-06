<script setup lang="ts">
import type { PositionedElement } from "vue-block-editor-headless";

import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getTextPlacement, TextAnchor } from "vue-block-editor-headless";

interface Props {
  element: PositionedElement;
}

// The text being edited in place, laid over its element at the screen point of the text's placement: centred on that point where the text
// Is centred, and hanging from it where a text box's text starts. It takes focus as it opens, and a press or a double click in it is no
// Gesture of the canvas
const draft = defineModel<string>({ required: true });
const { element } = defineProps<Props>();
const emit = defineEmits<{ blur: []; compositionEnd: []; compositionStart: []; keydown: [event: KeyboardEvent] }>();
const whiteboardEditorStore = useWhiteboardEditorStore();
const { viewport } = storeToRefs(whiteboardEditorStore);
const textarea = useTemplateRef("textarea");
const style = computed(() => {
  const placement = getTextPlacement(element);
  if (placement === undefined) return undefined;

  return {
    left: `${(placement.point.x - viewport.value.x) * viewport.value.scale}px`,
    top: `${(placement.point.y - viewport.value.y) * viewport.value.scale}px`,
    transform: placement.textAnchor === TextAnchor.Middle ? "translate(-50%, -50%)" : undefined,
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
    w-48
    resize-none
    absolute
    ui-field
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
