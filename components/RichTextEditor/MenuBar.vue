<script setup lang="ts">
import { Editor } from "@tiptap/vue-3";
import { mergeProps } from "vue";

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
    isDivider: true,
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
      <v-tooltip v-else :key="index" location="top" :text="item.title">
        <template #activator="{ props: tooltipProps }">
          <v-btn rd="0!" variant="flat" :="mergeProps(item, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
  </div>
</template>
