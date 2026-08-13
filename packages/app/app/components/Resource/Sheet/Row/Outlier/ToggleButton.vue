<script setup lang="ts">
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";
import { useOutlierStore } from "@/store/resource/sheet/outlier";

const outlierStore = useOutlierStore();
const { isOutlierHighlightEnabled } = storeToRefs(outlierStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{
      ...DENSE_ICON_BUTTON_PROPS,
      color: isOutlierHighlightEnabled ? 'warning' : undefined,
      variant: 'text',
    }"
    :icon="isOutlierHighlightEnabled ? 'mdi-alert-circle' : 'mdi-alert-circle-outline'"
    :text="isOutlierHighlightEnabled ? 'Hide Outlier Highlighting' : 'Show Outlier Highlighting'"
    @click.stop="isOutlierHighlightEnabled = !isOutlierHighlightEnabled"
  />
</template>
