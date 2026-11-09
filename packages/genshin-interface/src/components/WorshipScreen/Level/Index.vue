<script setup lang="ts">
import { WorshipLevelState } from "#src/models/WorshipLevelState";
import {
  GAME_ROW_HOVER,
  GAME_ROW_PRESS,
  INTERACTION_HOVER_DURATION,
  INTERACTION_REST_DURATION,
} from "#src/services/constants";

interface Props {
  // The rewards the level pays, each by its name and its count, in the order it pays them
  rewards: { count: number; name: string }[];
  // The word the stamina row opens with, and the stamina the level adds to the maximum
  staminaLabel: string;
  staminaShare: number;
  // Claimable once the region has reached the level and its rewards are not yet taken, locked until it is reached
  state: WorshipLevelState;
}

const { rewards, staminaLabel, staminaShare } = defineProps<Props>();
const emit = defineEmits<{ claim: [] }>();
// The lines the level pays: its stamina first, then each reward by its name and its count
const lines = computed(() => [
  `${staminaLabel} +${staminaShare}`,
  ...rewards.map(({ count, name }) => `${name} × ${count}`),
]);
</script>

<template>
  <!-- The level's rewards as the game lists them: a light strip per reward with its icon and its name, a padlock over each
       until the level is reached. The strips are one button, which a claim takes once the level is claimable -->
  <button class="reward-list" type="button" :disabled="state !== WorshipLevelState.Claimable" @click="emit('claim')">
    <span v-for="line of lines" :key="line" class="reward">
      <span class="icon" aria-hidden="true" />
      <span class="name">{{ line }}</span>
      <svg v-if="state === WorshipLevelState.Locked" class="lock" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    </span>
  </button>
</template>

<style scoped>
.reward-list {
  --state-duration: v-bind(INTERACTION_REST_DURATION);
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: calc(var(--unit) * 7);
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: inherit;
  font: inherit;
}

/* Claimable, the whole list is one button, so hovering or focusing it lights every strip with a list row's tint, behind
   the strip's words, and a press tints it stronger at once */
.reward-list:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(INTERACTION_HOVER_DURATION);
}

@media (hover: hover) {
  .reward-list:enabled:hover {
    --state-duration: v-bind(INTERACTION_HOVER_DURATION);
  }
}

.reward-list:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
}

.reward {
  position: relative;
  isolation: isolate;
  display: flex;
  height: calc(var(--unit) * 75);
  align-items: center;
  gap: calc(var(--unit) * 18);
  padding-left: calc(var(--unit) * 11);
  background: #e5e6dc;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
}

.reward::after {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-color: v-bind(GAME_ROW_HOVER);
  content: "";
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--state-duration);
}

.reward-list:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) .reward::after {
  opacity: 1;
}

@media (hover: hover) {
  .reward-list:enabled:hover .reward::after {
    opacity: 1;
  }
}

.reward-list:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) .reward::after {
  background-color: v-bind(GAME_ROW_PRESS);
  opacity: 1;
}

/* The item's own art ships nowhere, so its icon is a plain tile until the game's icon is recorded */
.icon {
  flex: none;
  width: calc(var(--unit) * 65);
  height: calc(var(--unit) * 65);
  background: #8c8a80;
}

.lock {
  position: absolute;
  top: 50%;
  right: calc(var(--unit) * 20);
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  color: #bdbeb3;
  translate: 0 -50%;
}

.lock rect {
  fill: currentcolor;
}

.lock path {
  fill: none;
  stroke: currentcolor;
  stroke-width: 2.5;
}
</style>
