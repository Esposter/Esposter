<script setup lang="ts">
const emit = defineEmits<{
  "update:delete-mode": [value: true];
}>();
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small', tile: true }"
    icon="mdi-delete"
    text="Delete Post"
    @click="emit('update:delete-mode', true)"
  />
</template>
