<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  editor?: Editor;
}

const { editor } = defineProps<Props>();
const isAltTextMenuOpen = ref(false);
const altText = ref("");
const applyAltText = () => {
  editor?.chain().focus().updateAttributes("image", { alt: altText.value }).run();
  isAltTextMenuOpen.value = false;
};
</script>

<template>
  <!-- Prefill from the selected image so opening the popover on an image that has alt text edits it rather than
       blanking it -->
  <UiPopover
    v-if="editor?.isActive('image')"
    v-model:is-open="isAltTextMenuOpen"
    label="Alt text"
    :variant="UiButtonVariant.Quiet"
    px-0
    @click="altText = String(editor?.getAttributes('image').alt ?? '')"
  >
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Edit" />
    </template>
    <form flex gap-2 items-end @submit.prevent="applyAltText()">
      <div w-64>
        <UiTextField v-model="altText" is-autofocus label="Alt text" placeholder="Describe the image" />
      </div>
      <UiButton :variant="UiButtonVariant.Accent" type="submit">Apply</UiButton>
    </form>
  </UiPopover>
</template>
