<script setup lang="ts">
import { GAME_WHITE, INTERACTION_HOVER_DURATION, INTERACTION_REST_DURATION } from "#src/services/constants";

interface Props {
  // What the button does, for a screen reader, since it shows its content alone
  label: string;
  // The disc's width and height, in the game's pixels at 1080 high
  size: number;
}

defineSlots<{ default: () => unknown }>();
const { label, size } = defineProps<Props>();
</script>

<template>
  <!-- A white disc under a soft dark rim, its content centred on it as the game centres its icons -->
  <button
    class="disc-button cream-disc-press ring-button"
    :aria-label="label"
    type="button"
    :style="{ '--size': size }"
  >
    <slot />
  </button>
</template>

<style scoped>
.disc-button {
  --hover-duration: v-bind(INTERACTION_HOVER_DURATION);
  --state-duration: v-bind(INTERACTION_REST_DURATION);
  display: grid;
  width: calc(var(--unit) * var(--size));
  height: calc(var(--unit) * var(--size));
  padding: 0;
  border: none;
  border-radius: 50%;
  background: v-bind(GAME_WHITE);
  box-shadow: 0 0 calc(var(--unit) * 3) calc(var(--unit) * 1) rgb(0 0 0 / 0.3);
  outline: calc(var(--unit) * 1) solid transparent;
  cursor: inherit;
  place-items: center;
}
</style>

<style scoped src="../../styles/creamDiscPress.css"></style>

<style scoped src="../../styles/ringButton.css"></style>
