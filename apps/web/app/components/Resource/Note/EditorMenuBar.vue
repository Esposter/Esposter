<script setup lang="ts">
import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/vue-3";

import { getNoteBlockMenuItems } from "@/services/resource/note/getNoteBlockMenuItems";
import { getListMenuItems } from "@/services/richTextEditor/getListMenuItems";
import { getTextFormatMenuItems } from "@/services/richTextEditor/getTextFormatMenuItems";

interface Props {
  editor?: Editor;
}

const { editor } = defineProps<Props>();
const items = computed<MenuItem[]>(() => [
  ...getNoteBlockMenuItems(editor),
  { isDivider: true },
  ...getTextFormatMenuItems(editor),
  {
    active: editor?.isActive("code"),
    icon: "i-mdi:code-tags",
    onClick: () => {
      editor?.chain().focus().toggleCode().run();
    },
    title: "Code",
  },
  { isDivider: true },
  ...getListMenuItems(editor),
]);
</script>

<template>
  <div p-1 flex flex-wrap w-full items-center>
    <RichTextEditorMenuBarButtons :items />
    <div aria-hidden="true" mx-1 bg-divider shrink-0 h-6 w="[var(--ui-border-width)]" self-center />
    <ResourceNoteLinkMenuButton :editor />
  </div>
</template>
