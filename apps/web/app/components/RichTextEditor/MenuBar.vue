<script setup lang="ts">
import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/vue-3";

import { getRichTextMenuItems } from "@/services/richTextEditor/getRichTextMenuItems";

interface Props {
  editor?: Editor;
}

const { editor } = defineProps<Props>();
const items = computed<MenuItem[]>(() => getRichTextMenuItems(editor));
</script>

<template>
  <div p-1 flex flex-wrap gap-1 w-full ui-bar items-center>
    <RichTextEditorMenuBarButtons :items />
  </div>
</template>
