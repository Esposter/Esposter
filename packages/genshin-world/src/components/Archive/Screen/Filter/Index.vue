<script setup lang="ts">
interface Props {
  // The filter's name, which the game's words set beside its icon
  label: string;
}

defineProps<Props>();
</script>

<template>
  <span class="filter" aria-hidden="true">
    <svg class="filter-icon" viewBox="0 0 22 24">
      <polygon fill="#3f3d4b" points="0,0 22,0 14,11 14,24 8,20 8,11" />
    </svg>
    <span class="filter-label">{{ label }}</span>
    <svg class="filter-caret" viewBox="0 0 15 8">
      <polygon fill="#3d3c48" points="0,0 15,0 7.5,8" />
    </svg>
  </span>
</template>

<style scoped>
.filter {
  position: absolute;
  top: calc(var(--unit) * 995);
  left: calc(var(--unit) * 140);
  width: calc(var(--unit) * 631);
  height: calc(var(--unit) * 49);
  border-radius: calc(var(--unit) * 25);
  background: #ebe5d6;
}

.filter-icon {
  position: absolute;
  top: calc(var(--unit) * 13);
  left: calc(var(--unit) * 18);
  width: calc(var(--unit) * 22);
  height: calc(var(--unit) * 24);
}

.filter-label {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 49);
  color: #2e2f3b;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 49);
  white-space: nowrap;
}

.filter-caret {
  position: absolute;
  top: calc(var(--unit) * 21);
  left: calc(var(--unit) * 597);
  width: calc(var(--unit) * 15);
  height: calc(var(--unit) * 8);
}
</style>
