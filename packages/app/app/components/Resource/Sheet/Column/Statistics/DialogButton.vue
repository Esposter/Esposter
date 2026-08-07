<script setup lang="ts">
const isOpen = ref(false);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    icon="mdi-sigma"
    text="Column Statistics"
    @click.stop="isOpen = true"
  />
  <ResourceSheetColumnStatisticsDialog v-model="isOpen" />
</template>
