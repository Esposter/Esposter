<script setup lang="ts">
import type { GameText } from "genshin-text";

import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The member on the field's HP, its Max HP and its level
  health: number;
  level: number;
  maxHealth: number;
}

const { gameText, health, level, maxHealth } = defineProps<Props>();
</script>

<template>
  <!-- The member on the field's HP bar filling its container at the bottom's middle, its HP over it and its level before
       It, whole numbers as the game writes them -->
  <div class="health">
    <span class="level">{{ fillGameTextValues(gameText[GameTextKey.LevelFormat], level) }}</span>
    <div
      class="track"
      :aria-label="gameText[GameTextKey.Health]"
      :aria-valuemax="Math.round(maxHealth)"
      aria-valuemin="0"
      :aria-valuenow="Math.ceil(health)"
      role="meter"
    >
      <span class="fill" :style="{ width: `${(health / maxHealth) * 100}%` }" />
    </div>
    <span class="value" aria-hidden="true">{{ Math.ceil(health) }} / {{ Math.round(maxHealth) }}</span>
  </div>
</template>

<style scoped>
/* The bar fills its container, the 512 by 20 canvas units the game draws at half scale, so every length here is in
   Its units. Measured off the English PC client's world HUD at 1080 high and the mobile client's at 934:
   The bar's ends come to a point 7.5 units long, its fill is a flat lime over a black at two fifths, its HP is set 28
   Units high on its middle, and its level 25 high stands 24 units before its point */
.health {
  position: relative;
  height: 100%;
  color: #fff;
  line-height: 1;
  text-shadow: 0 0 calc(var(--canvas-unit) * 5) rgb(0 0 0 / 0.7);
}

.track {
  height: 100%;
  overflow: hidden;
  background: rgb(0 0 0 / 0.4);
  clip-path: polygon(
    calc(var(--canvas-unit) * 7.5) 0,
    calc(100% - var(--canvas-unit) * 7.5) 0,
    100% 50%,
    calc(100% - var(--canvas-unit) * 7.5) 100%,
    calc(var(--canvas-unit) * 7.5) 100%,
    0 50%
  );
}

.fill {
  display: block;
  height: 100%;
  background: #93d621;
}

.level,
.value {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  white-space: nowrap;
}

.level {
  right: calc(100% + var(--canvas-unit) * 24);
  font-size: calc(var(--canvas-unit) * 25);
}

.value {
  left: 50%;
  font-size: calc(var(--canvas-unit) * 28);
  translate: -50% -50%;
}
</style>
