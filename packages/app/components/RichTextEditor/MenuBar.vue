<script setup lang="ts">
import type { IsDivider } from "@/models/richTextEditor/IsDivider";
import type { MenuItem } from "@/models/richTextEditor/MenuItem";
import type { Editor } from "@tiptap/vue-3";

import { mergeProps } from "vue";

interface MenuBarProps {
  editor?: Editor;
}

const { editor } = defineProps<MenuBarProps>();
const items = computed<MenuItem[]>(() => [
  {
    active: editor?.isActive("bold"),
    icon: "mdi-format-bold",
    onClick: () => editor?.chain().focus().toggleBold().run(),
    title: "Bold",
  },
  {
    active: editor?.isActive("italic"),
    icon: "mdi-format-italic",
    onClick: () => editor?.chain().focus().toggleItalic().run(),
    title: "Italic",
  },
  {
    active: editor?.isActive("strike"),
    icon: "mdi-format-strikethrough-variant",
    onClick: () => editor?.chain().focus().toggleStrike().run(),
    title: "Strike",
  },
  {
    isDivider: true,
  },
  {
    active: editor?.isActive("bulletList"),
    icon: "mdi-format-list-bulleted",
    onClick: () => editor?.chain().focus().toggleBulletList().run(),
    title: "Bullet List",
  },
  {
    active: editor?.isActive("orderedList"),
    icon: "mdi-format-list-numbered",
    onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    title: "Ordered List",
  },
  {
    isDivider: true,
  },
  {
    disabled: !editor?.can().undo(),
    icon: "mdi-undo",
    onClick: () => editor?.chain().focus().undo().run(),
    title: "Undo",
  },
  {
    disabled: !editor?.can().redo(),
    icon: "mdi-redo",
    onClick: () => editor?.chain().focus().redo().run(),
    title: "Redo",
  },
]);
const isDivider = (value: MenuItem): value is IsDivider => "isDivider" in value;
</script>

<template>
  <div w-full flex flex-wrap>
    <template v-for="(item, index) of items" :key="index">
      <v-divider v-if="isDivider(item)" h-8="!" self-center="!" thickness="2" vertical />
      <v-tooltip v-else :text="item.title">
        <template #activator="{ props: tooltipProps }">
          <v-btn rd-none="!" :="mergeProps(item, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
  </div>
</template>
