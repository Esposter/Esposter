<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";

const sheetHistoryStore = useSheetHistoryStore();
const { isRedoable, redoDescription } = storeToRefs(sheetHistoryStore);
const { redoSheet } = useSheetHistory();
const tooltipHtml = useHistoryTooltipHtml(redoDescription, "Redo", "Ctrl+Shift+Z");
</script>

<template>
  <UiTooltip label="Redo">
    <template #default="{ activatorProps }">
      <UiButton
        :="activatorProps"
        aria-label="Redo"
        :disabled="!isRedoable"
        :variant="UiButtonVariant.Quiet"
        px-0
        @click="redoSheet"
      >
        <UiIcon :meaning="UiIconMeaning.Redo" />
      </UiButton>
    </template>
    <template #content>
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized markdown of the command's description -->
      <div v-html="tooltipHtml" />
    </template>
  </UiTooltip>
</template>
