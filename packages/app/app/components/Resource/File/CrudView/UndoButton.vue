<script setup lang="ts">
import type { DataSourceItem } from "#shared/models/resource/file/datasource/DataSourceItem";

import { useFileStore } from "@/store/resource/file";
import { useFileHistoryStore } from "@/store/resource/file/history";

const fileStore = useFileStore();
const { dataSource } = storeToRefs(fileStore);
const fileHistoryStore = useFileHistoryStore();
const { undo } = fileHistoryStore;
const { isUndoable, undoDescription } = storeToRefs(fileHistoryStore);
const tooltipHtml = useHistoryTooltipHtml(undoDescription, "Undo", "Ctrl+Z");

onKeyStroke(["z", "Z"], (event) => {
  if ((!event.ctrlKey && !event.metaKey) || event.shiftKey) return;
  event.preventDefault();
  undo(editedItem.value);
});
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ disabled: !isUndoable, variant: 'text' }"
    icon="mdi-undo"
    :tooltip-props="{ location: 'bottom' }"
    @click="undo(editedItem)"
  >
    <div v-html="tooltipHtml" />
  </StyledTooltipIconButton>
</template>
