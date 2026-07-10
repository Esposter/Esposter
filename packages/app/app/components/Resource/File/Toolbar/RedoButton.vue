<script setup lang="ts">
import { useFileStore } from "@/store/resource/file";
import { useFileHistoryStore } from "@/store/resource/file/history";

const fileStore = useFileStore();
const { saveFile } = fileStore;
const { dataSource } = storeToRefs(fileStore);
const fileHistoryStore = useFileHistoryStore();
const { redo } = fileHistoryStore;
const { isRedoable, redoDescription } = storeToRefs(fileHistoryStore);
const tooltipHtml = useHistoryTooltipHtml(redoDescription, "Redo", "Ctrl+Shift+Z");
const onRedo = async () => {
  if (!isRedoable.value) return;
  redo(dataSource.value);
  await saveFile();
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
