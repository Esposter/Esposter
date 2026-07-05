<script setup lang="ts">
const emit = defineEmits<{
  "update:update-mode": [value: true];
}>();
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small', tile: true }"
    icon="mdi-pencil"
    text="Edit Comment"
    @click="emit('update:update-mode', true)"
  />
</template>
