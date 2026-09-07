<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { mergeProps } from "vue";

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
  <v-menu v-model="isLinkMenuOpen" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Link">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            density="comfortable"
            tile
            icon="mdi-link-variant"
            :active="editor?.isActive('link')"
            :="mergeProps(menuProps, tooltipProps)"
            @click="onOpenLinkMenu"
          />
        </template>
      </v-tooltip>
    </template>
    <v-sheet pa-2 flex gap-x-2 items-center>
      <v-text-field
        v-model="linkUrl"
        min-width="16rem"
        density="compact"
        placeholder="https://example.com"
        @keydown.enter="applyLink"
      />
      <StyledButton @click="applyLink">Apply</StyledButton>
    </v-sheet>
  </v-menu>
</template>
