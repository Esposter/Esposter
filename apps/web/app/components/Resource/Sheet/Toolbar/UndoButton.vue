<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";

const sheetHistoryStore = useSheetHistoryStore();
const { isUndoable, undoDescription } = storeToRefs(sheetHistoryStore);
const { undoSheet } = useSheetHistory();
const tooltipHtml = useHistoryTooltipHtml(undoDescription, "Undo", "Ctrl+Z");
</script>

<template>
  <UiTooltip label="Undo">
    <template #default="{ activatorProps }">
      <UiButton
        :="activatorProps"
        aria-label="Undo"
        :disabled="!isUndoable"
        :variant="UiButtonVariant.Quiet"
        px-0
        @click="undoSheet()"
      >
        <UiIcon :meaning="UiIconMeaning.Undo" />
      </UiButton>
    </template>
    <template #content>
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized markdown of the command's description -->
      <div v-html="tooltipHtml" />
    </template>
  </UiTooltip>
</template>
