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
    icon: "mdi-format-bold",
    title: "Bold",
    onClick: () => editor?.chain().focus().toggleBold().run(),
    active: editor?.isActive("bold"),
  },
  {
    icon: "mdi-format-italic",
    title: "Italic",
    onClick: () => editor?.chain().focus().toggleItalic().run(),
    active: editor?.isActive("italic"),
  },
  {
    icon: "mdi-format-strikethrough-variant",
    title: "Strike",
    onClick: () => editor?.chain().focus().toggleStrike().run(),
    active: editor?.isActive("strike"),
  },
  {
    isDivider: true,
  },
  {
    icon: "mdi-format-list-bulleted",
    title: "Bullet List",
    onClick: () => editor?.chain().focus().toggleBulletList().run(),
    active: editor?.isActive("bulletList"),
  },
  {
    icon: "mdi-format-list-numbered",
    title: "Ordered List",
    onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    active: editor?.isActive("orderedList"),
  },
]);
const isDivider = (value: MenuItem): value is IsDivider => "isDivider" in value;
</script>

<template>
  <div w-full flex flex-wrap>
    <template v-for="(item, index) in items" :key="index">
      <v-divider v-if="isDivider(item)" h-8="!" self-center="!" thickness="2" vertical />
      <v-tooltip v-else :text="item.title">
        <template #activator="{ props: tooltipProps }">
          <v-btn rd-0="!" :="mergeProps(item, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
  </div>
</template>
