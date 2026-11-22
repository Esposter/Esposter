<script setup lang="ts">
import type { Item } from "#src/models/shared/Item";
import type { Editor } from "@tiptap/core";

import { IMAGE_UPLOAD_MIME_TYPES } from "#shared/services/file/constants";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getNoteBlockMenuItems } from "#src/services/resource/note/getNoteBlockMenuItems";
import { getListMenuItems } from "#src/services/richTextEditor/getListMenuItems";
import { getTextFormatMenuItems } from "#src/services/richTextEditor/getTextFormatMenuItems";

interface Props {
  editor?: Editor | undefined;
}

const { editor } = defineProps<Props>();
const insertNoteImages = useInsertNoteImages();
const { onChange, open: openImagePicker } = useFileDialog({
  accept: IMAGE_UPLOAD_MIME_TYPES.join(","),
  multiple: true,
});
onChange((pickedFiles) => {
  if (editor && pickedFiles) insertNoteImages(editor, [...pickedFiles]);
});
const items = computed(() => getTextFormatMenuItems(editor));
// The block, insert and list commands wait in the overflow menu on every width, so the bar keeps its marks and one row
const listItems = computed<Item[]>(() =>
  [
    ...getNoteBlockMenuItems(editor),
    {
      icon: "i-mdi:table",
      isSelectionFree: true,
      onClick: () => {
        editor?.chain().focus().insertTable({ cols: 3, rows: 3, withHeaderRow: true }).run();
      },
      title: "Table",
    },
    { isSelectionFree: true, meaning: UiIconMeaning.Image, onClick: () => openImagePicker(), title: "Image" },
    ...getListMenuItems(editor),
  ].map((item) => ({ ...item, isChecked: item.active })),
);
</script>

<template>
  <div p-1 flex w-full items-center>
    <RichTextEditorMenuBarButtons :editor :items />
    <ResourceNoteTableMenuButton :editor />
    <div aria-hidden="true" mx-1 bg-divider shrink-0 h-6 w="[var(--ui-border-width)]" self-center />
    <ResourceNoteLinkMenuButton :editor />
    <ResourceNoteAltTextMenuButton :editor />
    <UiOverflowMenu :items="listItems" label="More commands" />
  </div>
</template>
