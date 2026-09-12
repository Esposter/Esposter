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
  {
    active: editor?.isActive("paragraph"),
    icon: "mdi-format-paragraph",
    onClick: () => {
      editor?.chain().focus().setParagraph().run();
    },
    title: "Paragraph",
  },
  {
    active: editor?.isActive("heading", { level: 1 }),
    icon: "mdi-format-header-1",
    onClick: () => {
      editor?.chain().focus().toggleHeading({ level: 1 }).run();
    },
    title: "Heading 1",
  },
  {
    active: editor?.isActive("heading", { level: 2 }),
    icon: "mdi-format-header-2",
    onClick: () => {
      editor?.chain().focus().toggleHeading({ level: 2 }).run();
    },
    title: "Heading 2",
  },
  {
    active: editor?.isActive("heading", { level: 3 }),
    icon: "mdi-format-header-3",
    onClick: () => {
      editor?.chain().focus().toggleHeading({ level: 3 }).run();
    },
    title: "Heading 3",
  },
  { isDivider: true },
  ...getTextFormatMenuItems(editor),
  {
    active: editor?.isActive("code"),
    icon: "mdi-code-tags",
    onClick: () => {
      editor?.chain().focus().toggleCode().run();
    },
    title: "Code",
  },
  { isDivider: true },
  ...getListMenuItems(editor),
  {
    active: editor?.isActive("blockquote"),
    icon: "mdi-format-quote-close",
    onClick: () => {
      editor?.chain().focus().toggleBlockquote().run();
    },
    title: "Blockquote",
  },
]);
</script>

<template>
  <div flex flex-wrap w-full items-center>
    <RichTextEditorMenuBarButtons :items />
    <v-divider thickness="2" vertical h-6 self-center />
    <ResourceNoteLinkMenuButton :editor />
  </div>
</template>
