<script setup lang="ts">
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // Which way the arrow steps, -1 to the previous section and 1 to the next, the one arrow mirrored
  direction: number;
  // The name of the section the arrow steps to, which is the arrow's accessible name
  label: string;
}

defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <GameButton
    class="step"
    :aria-label="label"
    :data-step="direction"
    :kind="GameButtonKind.Disc"
    tip=""
    @click="emit('click')"
  >
    <svg viewBox="0 0 46 64">
      <polygon fill="#f2ecd9" points="30,11 7,32 30,53 30,42 20,32 30,23" />
      <polygon fill="#7b8599" points="29,23 38,32 29,41 20,32" />
      <polygon fill="#232b40" points="29,28 33,32 29,36 25,32" />
    </svg>
  </GameButton>
</template>

<style scoped>
/* Each arrow sits at the screen's middle edge, the next one mirrored from the previous */
.step {
  position: absolute;
  top: calc(var(--unit) * 508);
  width: calc(var(--unit) * 46);
  height: calc(var(--unit) * 64);
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.step[data-step="-1"] {
  left: calc(var(--unit) * 52);
}

.step[data-step="1"] {
  right: calc(var(--unit) * 52);
}

.step[data-step="1"] svg {
  transform: scaleX(-1);
}

.step svg {
  width: 100%;
  height: 100%;
}
</style>
