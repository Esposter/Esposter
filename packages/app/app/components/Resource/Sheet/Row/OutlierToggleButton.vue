<script setup lang="ts">
import { useOutlierStore } from "@/store/resource/sheet/outlier";

const outlierStore = useOutlierStore();
const { isOutlierHighlightEnabled } = storeToRefs(outlierStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{
      class: 'm-0',
      color: isOutlierHighlightEnabled ? 'warning' : undefined,
      size: 'small',
      tile: true,
      variant: 'text',
    }"
    :icon="isOutlierHighlightEnabled ? 'mdi-alert-circle' : 'mdi-alert-circle-outline'"
    :text="isOutlierHighlightEnabled ? 'Hide Outlier Highlighting' : 'Show Outlier Highlighting'"
    @click.stop="isOutlierHighlightEnabled = !isOutlierHighlightEnabled"
  />
</template>
