<script setup lang="ts">
import type { DataSourceItem } from "#shared/models/resource/file/datasource/DataSourceItem";

import { useFileStore } from "@/store/resource/file";
import { useFileHistoryStore } from "@/store/resource/file/history";

const fileStore = useFileStore();
const { dataSource } = storeToRefs(fileStore);
const fileHistoryStore = useFileHistoryStore();
const { redo } = fileHistoryStore;
const { isRedoable, redoDescription } = storeToRefs(fileHistoryStore);
const tooltipHtml = useHistoryTooltipHtml(redoDescription, "Redo", "Ctrl+Shift+Z");

onKeyStroke(["z", "Z"], (event) => {
  if ((!event.ctrlKey && !event.metaKey) || !event.shiftKey) return;
  event.preventDefault();
  redo(editedItem.value);
});

onKeyStroke(["y", "Y"], (event) => {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  redo(editedItem.value);
});
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ disabled: !isRedoable, variant: 'text' }"
    icon="mdi-redo"
    :tooltip-props="{ location: 'bottom' }"
    @click="redo(editedItem)"
  >
    <div v-html="tooltipHtml" />
  </StyledTooltipIconButton>
</template>
