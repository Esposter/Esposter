<script setup lang="ts">
import { Editor } from "@tiptap/vue-3";

interface MenuBarProps {
  editor?: Editor;
}

const props = defineProps<MenuBarProps>();
const editor = toRef(props, "editor");
const items = [
  {
    icon: "mdi-format-bold",
    title: "Bold",
    onClick: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive("bold"),
  },
  {
    icon: "mdi-format-italic",
    title: "Italic",
    onClick: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive("italic"),
  },
  {
    icon: "mdi-format-strikethrough-variant",
    title: "Strike",
    onClick: () => editor.value?.chain().focus().toggleStrike().run(),
    isActive: () => editor.value?.isActive("strike"),
  },
  {
    icon: "mdi-code-tags",
    title: "Code",
    onClick: () => editor.value?.chain().focus().toggleCode().run(),
    isActive: () => editor.value?.isActive("code"),
  },
  {
    type: "divider",
  },
  {
    icon: "mdi-format-header-1",
    title: "Heading 1",
    onClick: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 1 }),
  },
  {
    icon: "mdi-format-header-2",
    title: "Heading 2",
    onClick: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 2 }),
  },
  {
    icon: "mdi-format-header-3",
    title: "Heading 3",
    onClick: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 3 }),
  },
  {
    icon: "mdi-format-header-4",
    title: "Heading 4",
    onClick: () => editor.value?.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 4 }),
  },
  {
    icon: "mdi-format-header-5",
    title: "Heading 5",
    onClick: () => editor.value?.chain().focus().toggleHeading({ level: 5 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 5 }),
  },
  {
    icon: "mdi-format-header-6",
    title: "Heading 6",
    onClick: () => editor.value?.chain().focus().toggleHeading({ level: 6 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 6 }),
  },
  {
    icon: "mdi-format-paragraph",
    title: "Paragraph",
    onClick: () => editor.value?.chain().focus().setParagraph().run(),
    isActive: () => editor.value?.isActive("paragraph"),
  },
  {
    icon: "mdi-format-list-bulleted",
    title: "Bullet List",
    onClick: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive("bulletList"),
  },
  {
    icon: "mdi-format-list-numbered",
    title: "Ordered List",
    onClick: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive("orderedList"),
  },
  {
    icon: "mdi-code-not-equal-variant",
    title: "Code Block",
    onClick: () => editor.value?.chain().focus().toggleCodeBlock().run(),
    isActive: () => editor.value?.isActive("codeBlock"),
  },

  {
    type: "divider",
  },
  {
    icon: "mdi-arrow-u-left-top",
    title: "Undo",
    onClick: () => editor.value?.chain().focus().undo().run(),
  },
  {
    icon: "mdi-arrow-u-right-top",
    title: "Redo",
    onClick: () => editor.value?.chain().focus().redo().run(),
  },
];
</script>

<template>
  <div display="flex" flex="wrap">
    <template v-for="(item, index) in items">
      <v-divider
        v-if="item.type === 'divider'"
        :key="`divider${index}`"
        thickness="2"
        vertical
        m="x-4!"
        h="8!"
        self="center!"
      />
      <v-btn v-else :key="index" rd="0!" bg="transparent!" shadow="none!" :="item" />
    </template>
  </div>
</template>
