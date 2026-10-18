<script setup lang="ts">
interface Props {
  // The picker's title, the action it is for, which also names the dialog to a reader
  title: string;
}

defineSlots<{ default: () => unknown }>();
const { title } = defineProps<Props>();
</script>

<template>
  <div class="picker-shell" role="dialog" aria-modal="true" :aria-label="title">
    <p class="title">{{ title }}</p>
    <slot />
  </div>
</template>

<style scoped>
.picker-shell {
  position: absolute;
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 120);
  width: calc(var(--unit) * 640);
  display: flex;
  flex-direction: column;
  padding: calc(var(--unit) * 24);
  border-radius: calc(var(--unit) * 12);
  background: rgb(20 24 36 / 0.92);
  color: #ece3d8;
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
}

.picker-shell :deep(.caption) {
  opacity: 0.8;
}
</style>
