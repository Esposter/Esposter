<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
</script>

<template>
  <p class="domains-only">
    <span class="switch" aria-hidden="true">
      <span class="knob">
        <svg viewBox="-1 -1 2 2">
          <path d="M -0.5 -0.5 L 0.5 0.5 M 0.5 -0.5 L -0.5 0.5" />
        </svg>
      </span>
    </span>
    <span>{{ gameText[GameTextKey.DomainsOnly] }}</span>
  </p>
</template>

<style scoped>
/* Provisional: the domains switch at the bottom left, measured off `map-overlay-jueyun` at 1080 high: a pill 90 units across
   and 46 high, 28 units in from the left and 1008 down, its words 134 units from the left. It is drawn off; the filter
   it names is not built yet */
.domains-only {
  position: absolute;
  top: calc(var(--unit) * 1008);
  left: calc(var(--unit) * 28);
  display: flex;
  margin: 0;
  align-items: center;
  color: #f0ead8;
  font-size: calc(var(--unit) * 28);
}

.switch {
  position: relative;
  box-sizing: border-box;
  width: calc(var(--unit) * 90);
  height: calc(var(--unit) * 46);
  margin-right: calc(var(--unit) * 17);
  border: calc(var(--unit) * 3) solid #f0f0f0;
  border-radius: calc(var(--unit) * 23);
  background: #3e4558;
}

.knob {
  position: absolute;
  top: calc(var(--unit) * 4);
  left: calc(var(--unit) * 4);
  display: grid;
  width: calc(var(--unit) * 34);
  height: calc(var(--unit) * 34);
  border-radius: 50%;
  background: #e9dfc8;
  place-items: center;
}

.knob svg {
  width: 50%;
  height: 50%;
  fill: none;
  stroke: #c9b98a;
  stroke-width: 0.3;
}
</style>
