<script setup lang="ts">
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";

const sheetStore = useSheetStore();
const { saveSheet } = sheetStore;
const { dataSource } = storeToRefs(sheetStore);
const sheetHistoryStore = useSheetHistoryStore();
const { redo } = sheetHistoryStore;
const { isRedoable, redoDescription } = storeToRefs(sheetHistoryStore);
const tooltipHtml = useHistoryTooltipHtml(redoDescription, "Redo", "Ctrl+Shift+Z");
const onRedo = async () => {
  if (!isRedoable.value) return;
  redo(dataSource.value);
  await saveSheet();
};

onKeyStroke(["z", "Z"], async (event) => {
  if ((!event.ctrlKey && !event.metaKey) || !event.shiftKey) return;
  event.preventDefault();
  await onRedo();
});

onKeyStroke(["y", "Y"], async (event) => {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  await onRedo();
});
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ disabled: !isRedoable, variant: 'text' }"
    icon="mdi-redo"
    :tooltip-props="{ location: 'bottom' }"
    @click="onRedo"
  >
    <div v-html="tooltipHtml" />
  </StyledTooltipIconButton>
</template>
