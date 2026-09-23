<script setup lang="ts">
const isFullScreenDialog = defineModel<boolean>({ default: false });
</script>

<template>
  <StyledTooltipIconButton
    :icon="isFullScreenDialog ? 'i-mdi:fullscreen-exit' : 'i-mdi:fullscreen'"
    :text="isFullScreenDialog ? 'Exit full screen mode' : 'Enter full screen mode'"
    @click="isFullScreenDialog = !isFullScreenDialog"
  />
</template>
