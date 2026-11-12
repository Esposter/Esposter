<script setup lang="ts">
import type { ImageElement } from "vue-block-editor-headless";

import { useWhiteboardStore } from "@/store/resource/whiteboard";

interface Props {
  element: ImageElement;
  index: number;
}

// The alt text of one image, which names it to assistive technology. The field holds a draft that is committed once, when the owner leaves the field or
// Presses Enter, so a typed name is one edit, and an edit with no change to the name makes none. A change the store makes to the alt text, such as an undo,
// Shows in the field
const { element, index } = defineProps<Props>();
const whiteboardStore = useWhiteboardStore();
const { updateElementProperty } = whiteboardStore;
const draft = ref(element.altText);
watch(
  () => element.altText,
  (newAltText) => {
    draft.value = newAltText;
  },
);
const commit = () => {
  if (draft.value !== element.altText) updateElementProperty(index, { property: "altText", value: draft.value });
};
</script>

<template>
  <UiTextField
    v-model="draft"
    hint="Read by assistive technology in place of the picture"
    label="Alt text"
    placeholder="Describe the image"
    @focusout="commit()"
    @keydown.enter.prevent="commit()"
  />
</template>
