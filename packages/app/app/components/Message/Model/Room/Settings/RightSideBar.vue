<script setup lang="ts">
const emit = defineEmits<{ close: [event: MouseEvent] }>();
</script>

<template>
  <MessageModelSettingsRightSideBar @close="emit('close', $event)" />
</template>
