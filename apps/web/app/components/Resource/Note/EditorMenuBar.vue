<script setup lang="ts">
import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/vue-3";

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
  {
    active: editor?.isActive("bold"),
    icon: "mdi-format-bold",
    onClick: () => {
      editor?.chain().focus().toggleBold().run();
    },
    title: "Bold",
  },
  {
    active: editor?.isActive("italic"),
    icon: "mdi-format-italic",
    onClick: () => {
      editor?.chain().focus().toggleItalic().run();
    },
    title: "Italic",
  },
  {
    active: editor?.isActive("code"),
    icon: "mdi-code-tags",
    onClick: () => {
      editor?.chain().focus().toggleCode().run();
    },
    title: "Code",
  },
  { isDivider: true },
  {
    active: editor?.isActive("bulletList"),
    icon: "mdi-format-list-bulleted",
    onClick: () => {
      editor?.chain().focus().toggleBulletList().run();
    },
    title: "Bullet List",
  },
  {
    active: editor?.isActive("orderedList"),
    icon: "mdi-format-list-numbered",
    onClick: () => {
      editor?.chain().focus().toggleOrderedList().run();
    },
    title: "Ordered List",
  },
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
