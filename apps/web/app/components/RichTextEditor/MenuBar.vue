<script setup lang="ts">
import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/vue-3";

import { getListMenuItems } from "@/services/richTextEditor/getListMenuItems";
import { getTextFormatMenuItems } from "@/services/richTextEditor/getTextFormatMenuItems";

interface Props {
  editor?: Editor;
}

const { editor } = defineProps<Props>();
const items = computed<MenuItem[]>(() => [
  ...getTextFormatMenuItems(editor),
  {
    active: editor?.isActive("strike"),
    icon: "i-mdi:format-strikethrough-variant",
    onClick: () => {
      editor?.chain().focus().toggleStrike().run();
    },
    title: "Strike",
  },
  { isDivider: true },
  ...getListMenuItems(editor),
  { isDivider: true },
  {
    disabled: !editor?.can().undo(),
    icon: "i-mdi:undo",
    onClick: () => {
      editor?.chain().focus().undo().run();
    },
    title: "Undo",
  },
  {
    disabled: !editor?.can().redo(),
    icon: "i-mdi:redo",
    onClick: () => {
      editor?.chain().focus().redo().run();
    },
    title: "Redo",
  },
]);
</script>

<template>
  <div p-1 flex flex-wrap gap-1 w-full ui-bar items-center>
    <RichTextEditorMenuBarButtons :items />
  </div>
</template>
