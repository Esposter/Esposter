<script setup lang="ts">
import type { Editor } from "@tiptap/core";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  editor?: Editor | undefined;
}

defineProps<Props>();
const isLinkMenuOpen = ref(false);
const linkUrl = ref("");
</script>

<template>
  <!-- Prefill from the mark under the cursor so opening the menu on an existing link edits it rather than replacing
       it -->
  <UiPopover
    v-model:is-open="isLinkMenuOpen"
    :aria-pressed="editor?.isActive('link')"
    label="Link"
    :variant="UiButtonVariant.Quiet"
    px-0
    @update:is-open="(isOpen) => {
      if (isOpen) linkUrl = String(editor?.getAttributes('link').href ?? '');
    }"
  >
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Link" />
    </template>
    <UiForm
      flex
      gap-2
      items-end
      @submit="() => {
        if (linkUrl) editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        else editor?.chain().focus().extendMarkRange('link').unsetLink().run();
        isLinkMenuOpen = false;
      }"
    >
      <div w-64>
        <UiTextField v-model="linkUrl" is-autofocus label="Link address" placeholder="https://example.com" />
      </div>
      <UiButton :variant="UiButtonVariant.Accent" type="submit">Apply</UiButton>
    </UiForm>
  </UiPopover>
</template>
