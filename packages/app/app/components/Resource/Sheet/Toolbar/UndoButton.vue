<script setup lang="ts">
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";

const sheetStore = useSheetStore();
const { saveSheet } = sheetStore;
const { dataSource } = storeToRefs(sheetStore);
const sheetHistoryStore = useSheetHistoryStore();
const { undo } = sheetHistoryStore;
const { isUndoable, undoDescription } = storeToRefs(sheetHistoryStore);
const tooltipHtml = useHistoryTooltipHtml(undoDescription, "Undo", "Ctrl+Z");
const onUndo = async () => {
  if (!isUndoable.value) return;
  undo(dataSource.value);
  await saveSheet();
};

onKeyStroke(["z", "Z"], async (event) => {
  if ((!event.ctrlKey && !event.metaKey) || event.shiftKey) return;
  event.preventDefault();
  await onUndo();
});
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ disabled: !isUndoable, variant: 'text' }"
    icon="mdi-undo"
    :tooltip-props="{ location: 'bottom' }"
    @click="onUndo"
  >
    <div v-html="tooltipHtml" />
  </StyledTooltipIconButton>
</template>
