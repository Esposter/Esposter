<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <button class="tab" role="tab" type="button">
    <slot />
  </button>
</template>

<style scoped>
.tab {
  display: flex;
  height: calc(var(--unit) * 76);
  margin: 0;
  margin-bottom: calc(var(--unit) * 13);
  padding: calc(var(--unit) * 14) calc(var(--unit) * 30) 0;
  border: none;
  background: rgb(40 50 70 / 0.72);
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  justify-content: space-between;
  text-align: start;
}

.tab[aria-selected="true"] {
  outline: calc(var(--unit) * 2) solid #d3bc8e;
}
</style>
