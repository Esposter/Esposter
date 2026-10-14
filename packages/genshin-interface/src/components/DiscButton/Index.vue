<script setup lang="ts">
interface Props {
  // What the button does, for a screen reader, since it shows its content alone
  label: string;
  // The disc's width and height, in the game's pixels at 1080 high
  size: number;
}

const { label, size } = defineProps<Props>();
defineSlots<{ default: () => unknown }>();
</script>

<template>
  <!-- A white disc under a soft dark rim, its content centred on it as the game centres its icons -->
  <button class="disc-button" :aria-label="label" type="button" :style="{ '--size': size }">
    <slot />
  </button>
</template>

<style scoped>
.disc-button {
  display: grid;
  width: calc(var(--unit) * var(--size));
  height: calc(var(--unit) * var(--size));
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #fdfdfd;
  box-shadow: 0 0 calc(var(--unit) * 3) calc(var(--unit) * 1) rgb(0 0 0 / 0.3);
  cursor: inherit;
  place-items: center;
}
</style>
