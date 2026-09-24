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
    icon: "i-mdi:format-paragraph",
    onClick: () => {
      editor?.chain().focus().setParagraph().run();
    },
    title: "Paragraph",
  },
  {
    active: editor?.isActive("heading", { level: 1 }),
    icon: "i-mdi:format-header-1",
    onClick: () => {
      editor?.chain().focus().toggleHeading({ level: 1 }).run();
    },
    title: "Heading 1",
  },
  {
    active: editor?.isActive("heading", { level: 2 }),
    icon: "i-mdi:format-header-2",
    onClick: () => {
      editor?.chain().focus().toggleHeading({ level: 2 }).run();
    },
    title: "Heading 2",
  },
  {
    active: editor?.isActive("heading", { level: 3 }),
    icon: "i-mdi:format-header-3",
    onClick: () => {
      editor?.chain().focus().toggleHeading({ level: 3 }).run();
    },
    title: "Heading 3",
  },
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
  {
    active: editor?.isActive("blockquote"),
    icon: "i-mdi:format-quote-close",
    onClick: () => {
      editor?.chain().focus().toggleBlockquote().run();
    },
    title: "Blockquote",
  },
]);
</script>

<template>
  <div p-1 flex flex-wrap w-full items-center>
    <RichTextEditorMenuBarButtons :items />
    <div aria-hidden="true" mx-1 bg-border h-6 w="[var(--ui-border-width)]" self-center />
    <ResourceNoteLinkMenuButton :editor />
  </div>
</template>
