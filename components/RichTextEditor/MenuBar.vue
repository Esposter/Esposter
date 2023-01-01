<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { mergeProps } from "vue";

interface MenuBarProps {
  // @NOTE: Can probably use question mark syntax in vue 3.3
  editor: Editor | undefined;
}

type IsDivider = {
  isDivider: boolean;
};

type Item = {
  icon: string;
  title: string;
  onClick: () => void;
  active?: boolean;
};

type MenuItem = Item | IsDivider;

const props = defineProps<MenuBarProps>();
const { editor } = $(toRefs(props));
const items = $computed<MenuItem[]>(() => [
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
]);
const isDivider = (value: MenuItem): value is IsDivider => "isDivider" in value;
</script>

<template>
  <div display="flex" flex="wrap">
    <template v-for="(item, index) in items">
      <v-divider v-if="isDivider(item)" :key="`divider${index}`" thickness="2" vertical mx="4!" h="8!" self="center!" />
      <v-tooltip v-else :key="item.title" location="top" :text="item.title">
        <template #activator="{ props: tooltipProps }">
          <v-btn rd="0!" :="mergeProps(item, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-divider thickness="2" vertical mx="4!" h="8!" self="center!" />
    <EmojiPicker
      :tooltip-props="{ text: 'Choose an emoji' }"
      :button-attrs="{ rd: '0!' }"
      @select="(emoji) => editor?.chain().focus().insertContent(emoji).run()"
    />
  </div>
</template>
