<script setup lang="ts">
import { GAME_CREAM, INTERACTION_HOVER_MS, INTERACTION_REST_MS } from "#src/services/constants";

interface Props {
  // What the button does, for a screen reader, since it shows its content alone
  label: string;
  // The disc's width and height, in the game's pixels at 1080 high
  size: number;
}

const { label, size } = defineProps<Props>();
defineSlots<{ default: () => unknown }>();
const hoverDuration = `${INTERACTION_HOVER_MS}ms`;
const restDuration = `${INTERACTION_REST_MS}ms`;
</script>

<template>
  <!-- A white disc under a soft dark rim, its content centred on it as the game centres its icons -->
  <button class="disc-button ring-button" :aria-label="label" type="button" :style="{ '--size': size }">
    <slot />
  </button>
</template>

<style scoped>
.disc-button {
  --hover-duration: v-bind(hoverDuration);
  --state-duration: v-bind(restDuration);
  display: grid;
  width: calc(var(--unit) * var(--size));
  height: calc(var(--unit) * var(--size));
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #fdfdfd;
  box-shadow: 0 0 calc(var(--unit) * 3) calc(var(--unit) * 1) rgb(0 0 0 / 0.3);
  outline: calc(var(--unit) * 1) solid transparent;
  cursor: inherit;
  place-items: center;
}

.disc-button:enabled:is(:active, [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  background-color: rgb(73 83 103 / 0.5);
  color: v-bind(GAME_CREAM);
}
</style>

<style scoped src="../../styles/ringButton.css"></style>
