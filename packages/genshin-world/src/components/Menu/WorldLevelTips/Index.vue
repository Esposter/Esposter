<script setup lang="ts">
import type { GameText } from "genshin-text";

import { computeWorldLevelCooldown } from "#src/services/adventureRank/computeWorldLevelCooldown";
import { WORLD_LEVEL_COOLDOWN_CLOCK_INTERVAL_MS } from "#src/services/adventureRank/constants";
import { useIntervalFn, useNow } from "@vueuse/core";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the World Level is lowered, so the dialog tells what the button does now
  isWorldLevelLowered: boolean;
  // The server's clock minus this machine's, which the cooldown is read against
  serverClockOffsetMs?: number;
  // When the World Level last changed, from which the cooldown left is read
  worldLevelChangedAt?: Temporal.Instant;
}

const { gameText, isWorldLevelLowered, serverClockOffsetMs = 0, worldLevelChangedAt } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const titleId = useId();
const closeButton = useTemplateRef("closeButton");
const tips = computed(() =>
  gameText[isWorldLevelLowered ? GameTextKey.WorldLevelRevertTips : GameTextKey.WorldLevelLowerTips].split("\n"),
);
// Read as the dialog opens, at each look at the clock while it stays open, and whenever the World Level changes under it
const clock = useNow({ scheduler: (callback) => useIntervalFn(callback, WORLD_LEVEL_COOLDOWN_CLOCK_INTERVAL_MS) });
const cooldown = computed(() =>
  computeWorldLevelCooldown(
    worldLevelChangedAt,
    Temporal.Instant.fromEpochMilliseconds(clock.value.getTime() + serverClockOffsetMs),
  ),
);
// The dialog sits over the menu, so focus starts inside it, on its way back
onMounted(() => {
  closeButton.value?.focus();
});
</script>

<template>
  <!-- The dialog the World Level's info icon opens: the game's title, what the change does, and the hint of the cooldown
       left once a change has been made. Its colours are the game's own colour tags -->
  <div
    class="world-level-tips"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    @keydown.esc.stop="emit('close')"
  >
    <p :id="titleId" class="title">{{ gameText[GameTextKey.WorldLevelAdjustTitle] }}</p>
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
    <button ref="closeButton" class="close" type="button" @click="emit('close')">
      {{ gameText[GameTextKey.Back] }}
    </button>
  </div>
</template>

<style scoped>
/* Provisional where the game is not yet fitted: the dialog's size, its glass and its type wait on the English PC client's
   menu measured at 1080 high. Its place is the parent's, which draws it beside the World Level */
.world-level-tips {
  position: absolute;
  width: calc(var(--unit) * 560);
  padding: calc(var(--unit) * 12) calc(var(--unit) * 16);
  border-radius: calc(var(--unit) * 6);
  background: rgb(20 24 34 / 92%);
  color: #ece5d7;
  font-size: calc(var(--unit) * 16);
  line-height: 1.5;
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

.close {
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-decoration: underline;
}
</style>
