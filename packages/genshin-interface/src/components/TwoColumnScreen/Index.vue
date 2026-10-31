<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <!-- A screen drawn as two columns under a head row, its head spanning both. A screen of this shape takes its root from
       here, so a class on it names the screen and never restates the layout -->
  <div class="two-column-screen">
    <slot />
  </div>
</template>

<style scoped>
.two-column-screen {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  color: #ece5d8;
}
</style>
