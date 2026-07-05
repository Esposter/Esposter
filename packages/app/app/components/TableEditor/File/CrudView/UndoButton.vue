<script setup lang="ts">
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

const tableEditorStore = useTableEditorStore<DataSourceItem>();
const { editedItem } = storeToRefs(tableEditorStore);
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
