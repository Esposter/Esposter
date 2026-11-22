<script setup lang="ts">
import type { MenuItem } from "#src/models/shared/MenuItem";
import type { Editor } from "@tiptap/core";

import { getListMenuItems } from "#src/services/richTextEditor/getListMenuItems";
import { getRichTextMenuItems } from "#src/services/richTextEditor/getRichTextMenuItems";

interface Props {
  editor?: Editor | undefined;
}

const { editor } = defineProps<Props>();
const items = computed<MenuItem[]>(() => getRichTextMenuItems(editor));
// The occasional commands wait in the overflow menu on every width, so the bar stays one row rather than wrapping
const listItems = computed(() => getListMenuItems(editor).map((item) => ({ ...item, isChecked: item.active })));
</script>

<template>
  <div p-1 flex gap-1 w-full ui-bar items-center>
    <RichTextEditorMenuBarButtons :editor :items />
    <UiOverflowMenu :items="listItems" label="Lists" />
  </div>
</template>
