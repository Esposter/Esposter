<script setup lang="ts">
import type { GameText } from "genshin-text";

import { computeWorldLevelCooldown } from "#src/services/adventureRank/computeWorldLevelCooldown";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the World Level is lowered, so the panel tells what the button does now
  isWorldLevelLowered: boolean;
  // When the World Level last changed, from which the cooldown left is read as the panel opens
  worldLevelChangedAt?: Temporal.Instant;
}

const { gameText, isWorldLevelLowered, worldLevelChangedAt } = defineProps<Props>();
const tips =
  gameText[isWorldLevelLowered ? GameTextKey.WorldLevelRevertTips : GameTextKey.WorldLevelLowerTips].split("\n");
// The panel mounts as it opens, so the cooldown is read at the moment the player sees it
const cooldown = computeWorldLevelCooldown(worldLevelChangedAt, Temporal.Now.instant());
</script>

<template>
  <!-- The tip the World Level button opens while it is hovered or focused: the game's title, what the change does, and the
       hint of the cooldown left once a change has been made. Its colours are the game's own colour tags -->
  <div class="world-level-tips" role="tooltip">
    <p class="title">{{ gameText[GameTextKey.WorldLevelAdjustTitle] }}</p>
    <p v-for="(tip, tipIndex) of tips" :key="tipIndex" class="tip">
      <span
        v-for="(segment, segmentIndex) of splitGameTextColors(tip)"
        :key="segmentIndex"
        :style="{ color: segment.color }"
        >{{ segment.text }}</span
      >
    </p>
    <p v-if="cooldown" class="cooldown">
      {{ fillGameTextValues(gameText[GameTextKey.WorldLevelCooldownHint], cooldown.hours, cooldown.minutes) }}
    </p>
  </div>
</template>

<style scoped>
/* Provisional where the game is not yet fitted: the panel's size, its glass and its type wait on the English PC client's
   menu measured at 1080 high. Its place is the parent's, which draws it beside the World Level button */
.world-level-tips {
  position: absolute;
  width: calc(var(--unit) * 560);
  padding: calc(var(--unit) * 12) calc(var(--unit) * 16);
  border-radius: calc(var(--unit) * 6);
  background: rgb(20 24 34 / 92%);
  color: #ece5d7;
  font-size: calc(var(--unit) * 16);
  line-height: 1.5;
  pointer-events: none;
}

.title {
  margin: 0 0 calc(var(--unit) * 6);
  font-size: calc(var(--unit) * 18);
  font-weight: 600;
}

.tip,
.cooldown {
  margin: 0 0 calc(var(--unit) * 6);
}
</style>
