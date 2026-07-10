<script setup lang="ts">
import { useFileStore } from "@/store/resource/file";
import { useFileHistoryStore } from "@/store/resource/file/history";

const fileStore = useFileStore();
const { saveFile } = fileStore;
const { dataSource } = storeToRefs(fileStore);
const fileHistoryStore = useFileHistoryStore();
const { undo } = fileHistoryStore;
const { isUndoable, undoDescription } = storeToRefs(fileHistoryStore);
const tooltipHtml = useHistoryTooltipHtml(undoDescription, "Undo", "Ctrl+Z");
const onUndo = async () => {
  if (!isUndoable.value) return;
  undo(dataSource.value);
  await saveFile();
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
