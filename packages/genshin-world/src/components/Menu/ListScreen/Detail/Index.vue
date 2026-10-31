<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <div class="detail" role="tabpanel">
    <slot />
  </div>
</template>

<style scoped>
.detail {
  position: absolute;
  top: calc(var(--unit) * 105);
  bottom: calc(var(--unit) * 125);
  left: calc(var(--unit) * 877);
  display: flex;
  width: calc(var(--unit) * 899);
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}
</style>
