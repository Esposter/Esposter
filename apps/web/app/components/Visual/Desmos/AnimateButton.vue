<script setup lang="ts">
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <UiButton bottom-2 left-1 fixed @click="emit('click', $event)">Animate</UiButton>
</template>
