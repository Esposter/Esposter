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
  <!-- The member on the field's HP bar at the bottom's middle, its level before it and its HP under it, whole numbers as
       The game writes them -->
  <div class="health">
    <span class="level">{{ fillGameTextValues(gameText[GameTextKey.LevelFormat], level) }}</span>
    <div class="bar">
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
      <span aria-hidden="true">{{ Math.ceil(health) }}/{{ Math.round(maxHealth) }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Provisional: the bar's size, colours and type, and where the level and the numbers sit, measured off a recording of
   The English PC client's world HUD */
.health {
  display: flex;
  align-items: flex-start;
  color: #fff;
  font-size: calc(var(--unit) * 18);
  gap: calc(var(--unit) * 10);
  line-height: 1;
  text-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.7);
}

.bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 4);
}

.track {
  width: calc(var(--unit) * 340);
  height: calc(var(--unit) * 12);
  overflow: hidden;
  border-radius: calc(var(--unit) * 6);
  background: rgb(0 0 0 / 0.4);
}

.fill {
  display: block;
  height: 100%;
  background: #8fd14f;
}
</style>
