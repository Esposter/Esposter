<script setup lang="ts">
interface Props {
  // What the button does, for a screen reader, since it shows its content alone
  label: string;
}

defineProps<Props>();
defineSlots<{ default: () => unknown }>();
</script>

<template>
  <!-- The way out of a screen: a disc 58 units across at its top right, its fill, ring and mark left to the screen
       that places it -->
  <button class="close-button" :aria-label="label" type="button">
    <slot />
  </button>
</template>

<style scoped>
.close-button {
  position: absolute;
  top: calc(var(--unit) * 19);
  right: calc(var(--unit) * 48);
  width: calc(var(--unit) * 58);
  height: calc(var(--unit) * 58);
  padding: 0;
  box-sizing: border-box;
  border-radius: 50%;
}
</style>
