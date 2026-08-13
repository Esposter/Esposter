<script setup lang="ts">
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";

const isOpen = ref(false);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="DENSE_ICON_BUTTON_PROPS"
    icon="mdi-sigma"
    text="Column Statistics"
    @click.stop="isOpen = true"
  />
  <ResourceSheetColumnStatisticsDialog v-model="isOpen" />
</template>
