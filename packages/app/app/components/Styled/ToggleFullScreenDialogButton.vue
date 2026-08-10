<script setup lang="ts">
interface StyledToggleFullScreenDialogButtonProps {
  isFullScreenDialog: boolean;
}

const { isFullScreenDialog } = defineProps<StyledToggleFullScreenDialogButtonProps>();
const emit = defineEmits<{ click: [value: boolean] }>();
</script>

<template>
  <StyledTooltipIconButton
    :icon="isFullScreenDialog ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
    :text="isFullScreenDialog ? 'Exit full screen mode' : 'Enter full screen mode'"
    @click="emit('click', !isFullScreenDialog)"
  />
</template>
