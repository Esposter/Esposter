<script setup lang="ts">
import type { MenuItem } from "#src/models/shared/MenuItem";
import type { Editor } from "@tiptap/core";

import { getNoteBlockMenuItems } from "#src/services/resource/note/getNoteBlockMenuItems";
import { getListMenuItems } from "#src/services/richTextEditor/getListMenuItems";
import { getTextFormatMenuItems } from "#src/services/richTextEditor/getTextFormatMenuItems";

interface Props {
  // The editor of the text being edited, which the toolbar's controls act on
  editor: Editor;
  // Where the toolbar's top left sits in the app's document, placed by the canvas the way the node toolbar is
  position: { left: number; top: number };
}

const { editor } = defineProps<Props>();
const items = shallowRef<MenuItem[]>([]);
// Tiptap keeps no reactive state of its own, so the items are drawn again from each transaction: a mark's toggle, a block's
// Change and a focus change each dispatch one, and the buttons that act on the selection are enabled only while it is focused
watchImmediate(
  () => editor,
  (currentEditor, _previousEditor, onCleanup) => {
    const draw = () => {
      items.value = [
        ...getNoteBlockMenuItems(currentEditor, { isTaskListOffered: false }),
        { isDivider: true },
        ...getTextFormatMenuItems(currentEditor),
        { isDivider: true },
        ...getListMenuItems(currentEditor),
        { isDivider: true },
      ];
    };
    currentEditor.on("transaction", draw);
    draw();
    onCleanup(() => {
      currentEditor.off("transaction", draw);
    });
  },
);
</script>

<!-- The link control is the note's own, and it trails the items after a divider -->
<template>
  <div p-1 b-border bg-background flex gap-1 fixed :style="{ left: `${position.left}px`, top: `${position.top}px` }">
    <RichTextEditorMenuBarButtons :editor :items />
    <ResourceNoteLinkMenuButton :editor />
  </div>
</template>
