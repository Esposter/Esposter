<script setup lang="ts">
import type { MenuItem } from "#src/models/shared/MenuItem";
import type { Editor } from "@tiptap/core";

import { NOTE_IMAGE_MIME_TYPES } from "#shared/services/resource/note/constants";
import { getNoteBlockMenuItems } from "#src/services/resource/note/getNoteBlockMenuItems";
import { getListMenuItems } from "#src/services/richTextEditor/getListMenuItems";
import { getTextFormatMenuItems } from "#src/services/richTextEditor/getTextFormatMenuItems";

interface Props {
  editor?: Editor | undefined;
}

const { editor } = defineProps<Props>();
const insertNoteImages = useInsertNoteImages();
const { onChange, open: openImagePicker } = useFileDialog({ accept: NOTE_IMAGE_MIME_TYPES.join(","), multiple: true });
onChange((pickedFiles) => {
  if (editor && pickedFiles) insertNoteImages(editor, [...pickedFiles]);
});
const items = computed<MenuItem[]>(() => [
  ...getNoteBlockMenuItems(editor),
  {
    icon: "i-mdi:table",
    isSelectionFree: true,
    onClick: () => {
      editor?.chain().focus().insertTable({ cols: 3, rows: 3, withHeaderRow: true }).run();
    },
    title: "Table",
  },
  { icon: "i-mdi:image", isSelectionFree: true, onClick: () => openImagePicker(), title: "Image" },
  { isDivider: true },
  ...getTextFormatMenuItems(editor),
  { isDivider: true },
  ...getListMenuItems(editor),
]);
</script>

<template>
  <div p-1 flex flex-wrap w-full items-center>
    <RichTextEditorMenuBarButtons :editor :items />
    <ResourceNoteTableMenuButton :editor />
    <div aria-hidden="true" mx-1 bg-divider shrink-0 h-6 w="[var(--ui-border-width)]" self-center />
    <ResourceNoteLinkMenuButton :editor />
    <ResourceNoteAltTextMenuButton :editor />
  </div>
</template>
