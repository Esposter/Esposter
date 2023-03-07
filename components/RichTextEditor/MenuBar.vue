<script setup lang="ts">
import type { IsDivider } from "@/models/richTextEditor/IsDivider";
import type { MenuItem } from "@/models/richTextEditor/MenuItem";
import type { Editor } from "@tiptap/vue-3";
import { mergeProps } from "vue";

interface MenuBarProps {
  editor?: Editor;
}

const props = defineProps<MenuBarProps>();
const { editor } = toRefs(props);
const items = computed<MenuItem[]>(() => [
  {
    icon: "mdi-format-bold",
    title: "Bold",
    onClick: () => editor?.value?.chain().focus().toggleBold().run(),
    active: editor?.value?.isActive("bold"),
  },
  {
    icon: "mdi-format-italic",
    title: "Italic",
    onClick: () => editor?.value?.chain().focus().toggleItalic().run(),
    active: editor?.value?.isActive("italic"),
  },
  {
    icon: "mdi-format-strikethrough-variant",
    title: "Strike",
    onClick: () => editor?.value?.chain().focus().toggleStrike().run(),
    active: editor?.value?.isActive("strike"),
  },
  {
    isDivider: true,
  },
  {
    icon: "mdi-format-list-bulleted",
    title: "Bullet List",
    onClick: () => editor?.value?.chain().focus().toggleBulletList().run(),
    active: editor?.value?.isActive("bulletList"),
  },
  {
    icon: "mdi-format-list-numbered",
    title: "Ordered List",
    onClick: () => editor?.value?.chain().focus().toggleOrderedList().run(),
    active: editor?.value?.isActive("orderedList"),
  },
]);
const isDivider = (value: MenuItem): value is IsDivider => "isDivider" in value;
</script>

<template>
  <div w="full" display="flex" flex="wrap">
    <template v-for="(item, index) in items" :key="index">
      <v-divider v-if="isDivider(item)" thickness="2" vertical h="8!" self="center!" />
      <v-tooltip v-else location="top" :text="item.title">
        <template #activator="{ props: tooltipProps }">
          <v-btn rd="0!" :="mergeProps(item, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
  </div>
</template>
