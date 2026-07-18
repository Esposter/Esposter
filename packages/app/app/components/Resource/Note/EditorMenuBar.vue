<script setup lang="ts">
import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/vue-3";

import { checkIsDivider } from "@/services/shared/checkIsDivider";
import { mergeProps } from "vue";

interface NoteEditorMenuBarProps {
  editor?: Editor;
}

const { editor } = defineProps<NoteEditorMenuBarProps>();
const isLinkMenuOpen = ref(false);
const linkUrl = ref("");
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
// Prefill from the mark under the cursor so opening the menu on an existing link edits it rather than replacing it
const onOpenLinkMenu = () => {
  linkUrl.value = String(editor?.getAttributes("link").href ?? "");
};
const applyLink = () => {
  if (linkUrl.value) editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.value }).run();
  else editor?.chain().focus().extendMarkRange("link").unsetLink().run();
  isLinkMenuOpen.value = false;
};
</script>

<template>
  <div flex flex-wrap w-full items-center>
    <template v-for="(item, index) of items" :key="index">
      <v-divider v-if="checkIsDivider(item)" thickness="2" vertical h-6 self-center />
      <v-tooltip v-else :text="item.title">
        <template #activator="{ props: tooltipProps }">
          <!-- item.title would otherwise land on the button as a native title attribute, doubling the tooltip -->
          <v-btn density="comfortable" tile :="mergeProps(item, tooltipProps)" :title="undefined" />
        </template>
      </v-tooltip>
    </template>
    <v-divider thickness="2" vertical h-6 self-center />
    <v-menu v-model="isLinkMenuOpen" :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <v-tooltip text="Link">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              density="comfortable"
              tile
              icon="mdi-link-variant"
              :active="editor?.isActive('link')"
              :="mergeProps(menuProps, tooltipProps)"
              @click="onOpenLinkMenu"
            />
          </template>
        </v-tooltip>
      </template>
      <v-sheet pa-2 flex gap-x-2 items-center>
        <v-text-field
          v-model="linkUrl"
          min-width="16rem"
          density="compact"
          hide-details
          placeholder="https://example.com"
          @keydown.enter="applyLink"
        />
        <StyledButton @click="applyLink">Apply</StyledButton>
      </v-sheet>
    </v-menu>
  </div>
</template>
