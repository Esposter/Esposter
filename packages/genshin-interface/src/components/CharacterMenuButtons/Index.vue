<script setup lang="ts">
defineSlots<{ default: () => unknown }>();
</script>

<template>
  <!-- The two buttons beneath a character menu's panel, the game's pills, each the panel's half less the gap between them -->
  <div class="buttons">
    <slot />
  </div>
</template>

<style scoped>
.buttons {
  position: absolute;
  top: calc(var(--unit) * 859);
  right: 0;
  left: 0;
  display: flex;
  gap: calc(var(--unit) * 23);
}
</style>
