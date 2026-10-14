<script setup lang="ts">
defineSlots<{ default: () => unknown }>();
</script>

<template>
  <!-- The title a screen draws across its head, at the game's place for it in its own pixels at 1080 high (`--unit` a pixel
       of that frame). Its parent's rules add what it differs by, such as its line height -->
  <p class="title"><slot /></p>
</template>

<style scoped>
.title {
  position: absolute;
  top: calc(var(--unit) * 30);
  left: calc(var(--unit) * 145);
  margin: 0;
  font-size: calc(var(--unit) * 22);
}
</style>
