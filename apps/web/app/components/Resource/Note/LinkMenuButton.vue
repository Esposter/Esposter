<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  editor?: Editor;
}

const { editor } = defineProps<Props>();
const isLinkMenuOpen = ref(false);
const linkUrl = ref("");
// Prefill from the mark under the cursor so opening the menu on an existing link edits it rather than replacing it
const onOpenLinkMenu = () => {
  linkUrl.value = String(editor?.getAttributes("link").href ?? "");
};
const applyLink = () => {
  if (linkUrl.value) editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.value }).run();
  else editor?.chain().focus().extendMarkRange("link").unsetLink().run();
  isLinkMenuOpen.value = false;
};
</script>

<template>
  <UiPopover
    v-model:is-open="isLinkMenuOpen"
    :aria-pressed="editor?.isActive('link')"
    label="Link"
    :variant="UiButtonVariant.Quiet"
    px-0
    @click="onOpenLinkMenu()"
  >
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Link" />
    </template>
    <form p-2 flex gap-2 items-end @submit.prevent="applyLink()">
      <div w-64>
        <UiTextField v-model="linkUrl" is-autofocus label="Link address" placeholder="https://example.com" />
      </div>
      <UiButton :variant="UiButtonVariant.Accent" type="submit">Apply</UiButton>
    </form>
  </UiPopover>
</template>
