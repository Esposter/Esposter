<script setup lang="ts">
import { INTERACTION_HOVER_DURATION, INTERACTION_REST_DURATION } from "#src/services/constants";

interface Props {
  // The share of the member's Max HP it holds, which its health bar shows
  healthShare: number;
  // The member's level as the game writes it, when the host knows it
  levelText?: string;
  // The member's name in the reader's language, which names the card for a screen reader since the card shows its portrait alone
  name: string;
}

defineProps<Props>();
const emit = defineEmits<{ heal: [] }>();
</script>

<template>
  <!-- A member's card as the game's Blessing draws it: a green health bar over the portrait, and its level under the portrait
       on a pale tab. The portrait's art does not ship, so its tile is plain. A card whose level is not known draws no tab -->
  <button class="member" type="button" :aria-label="name" @click="emit('heal')">
    <span class="health"><span class="fill" :style="{ width: `${healthShare * 100}%` }" /></span>
    <span class="portrait" />
    <span v-if="levelText" class="level">{{ levelText }}</span>
  </button>
</template>

<style scoped>
.member {
  --state-duration: v-bind(INTERACTION_REST_DURATION);
  position: relative;
  width: calc(var(--unit) * 120);
  height: calc(var(--unit) * 169);
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  transition: filter var(--state-duration);
}

/* A card lights by its brightness when hovered or focused, and a press dims it at once, its size held */
.member:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(INTERACTION_HOVER_DURATION);
  filter: brightness(1.15);
}

@media (hover: hover) {
  .member:hover {
    --state-duration: v-bind(INTERACTION_HOVER_DURATION);
    filter: brightness(1.15);
  }
}

.member:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  filter: brightness(0.9);
}

.health {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 6);
}

.fill {
  display: block;
  height: 100%;
  background: #98d323;
}

.portrait {
  position: absolute;
  top: calc(var(--unit) * 17);
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 122);
  background: #a39480;
}

.level {
  position: absolute;
  top: calc(var(--unit) * 139);
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 30);
  background: #e6e5db;
  color: #46413c;
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
  text-align: center;
}
</style>
