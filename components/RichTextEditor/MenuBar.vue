<script setup lang="ts">
import { Editor } from "@tiptap/vue-3";

interface MenuBarProps {
  editor: Editor | undefined;
}

const props = defineProps<MenuBarProps>();
const { editor } = $(toRefs(props));
const items = [
  {
    icon: "mdi-format-bold",
    title: "Bold",
    onClick: () => editor?.chain().focus().toggleBold().run(),
    isActive: () => editor?.isActive("bold"),
  },
  {
    icon: "mdi-format-italic",
    title: "Italic",
    onClick: () => editor?.chain().focus().toggleItalic().run(),
    isActive: () => editor?.isActive("italic"),
  },
  {
    icon: "mdi-format-strikethrough-variant",
    title: "Strike",
    onClick: () => editor?.chain().focus().toggleStrike().run(),
    isActive: () => editor?.isActive("strike"),
  },
  {
    icon: "mdi-code-tags",
    title: "Code",
    onClick: () => editor?.chain().focus().toggleCode().run(),
    isActive: () => editor?.isActive("code"),
  },
  {
    isDivider: true,
  },
  {
    icon: "mdi-format-header-1",
    title: "Heading 1",
    onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor?.isActive("heading", { level: 1 }),
  },
  {
    icon: "mdi-format-header-2",
    title: "Heading 2",
    onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor?.isActive("heading", { level: 2 }),
  },
  {
    icon: "mdi-format-header-3",
    title: "Heading 3",
    onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => editor?.isActive("heading", { level: 3 }),
  },
  {
    icon: "mdi-format-header-4",
    title: "Heading 4",
    onClick: () => editor?.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: () => editor?.isActive("heading", { level: 4 }),
  },
  {
    icon: "mdi-format-header-5",
    title: "Heading 5",
    onClick: () => editor?.chain().focus().toggleHeading({ level: 5 }).run(),
    isActive: () => editor?.isActive("heading", { level: 5 }),
  },
  {
    icon: "mdi-format-header-6",
    title: "Heading 6",
    onClick: () => editor?.chain().focus().toggleHeading({ level: 6 }).run(),
    isActive: () => editor?.isActive("heading", { level: 6 }),
  },
  {
    icon: "mdi-format-paragraph",
    title: "Paragraph",
    onClick: () => editor?.chain().focus().setParagraph().run(),
    isActive: () => editor?.isActive("paragraph"),
  },
  {
    icon: "mdi-format-list-bulleted",
    title: "Bullet List",
    onClick: () => editor?.chain().focus().toggleBulletList().run(),
    isActive: () => editor?.isActive("bulletList"),
  },
  {
    icon: "mdi-format-list-numbered",
    title: "Ordered List",
    onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor?.isActive("orderedList"),
  },
  {
    icon: "mdi-code-not-equal-variant",
    title: "Code Block",
    onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
    isActive: () => editor?.isActive("codeBlock"),
  },
  {
    isDivider: true,
  },
  {
    icon: "mdi-arrow-u-left-top",
    title: "Undo",
    onClick: () => editor?.chain().focus().undo().run(),
  },
  {
    icon: "mdi-arrow-u-right-top",
    title: "Redo",
    onClick: () => editor?.chain().focus().redo().run(),
  },
];
</script>

<template>
  <div display="flex" flex="wrap">
    <template v-for="(item, index) in items">
      <v-divider v-if="item.isDivider" :key="`divider${index}`" thickness="2" vertical mx="4!" h="8!" self="center!" />
      <v-btn v-else :key="index" rd="0!" variant="flat" :="item" />
    </template>
  </div>
</template>
