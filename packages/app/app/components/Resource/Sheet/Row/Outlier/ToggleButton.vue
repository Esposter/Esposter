<script setup lang="ts">
import type { VBtn } from "vuetify/components";

import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";
import { useOutlierStore } from "@/store/resource/sheet/outlier";

const outlierStore = useOutlierStore();
const { isOutlierHighlightEnabled } = storeToRefs(outlierStore);
const buttonProps = computed<VBtn["$props"]>(() => ({
  ...DENSE_ICON_BUTTON_PROPS,
  color: isOutlierHighlightEnabled.value ? "warning" : undefined,
  variant: "text",
}));
</script>

<template>
  <StyledTooltipIconButton
    :button-props
    :icon="isOutlierHighlightEnabled ? 'mdi-alert-circle' : 'mdi-alert-circle-outline'"
    :text="isOutlierHighlightEnabled ? 'Hide Outlier Highlighting' : 'Show Outlier Highlighting'"
    @click.stop="isOutlierHighlightEnabled = !isOutlierHighlightEnabled"
  />
</template>
