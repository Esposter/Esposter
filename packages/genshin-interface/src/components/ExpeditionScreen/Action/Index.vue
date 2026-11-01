<script setup lang="ts">
import type { ExpeditionPlaceDetail } from "#src/models/ExpeditionPlaceDetail";

import GameButton from "#src/components/GameButton/Index.vue";
import { ExpeditionActionKind } from "#src/models/ExpeditionActionKind";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The picked place: its id, the action its button takes and the words it shows
  detail: ExpeditionPlaceDetail;
}

const picking = defineModel<boolean>("picking", { default: false });
const { detail } = defineProps<Props>();
const emit = defineEmits<{ claim: [placeId: number]; recall: [placeId: number] }>();

// The picked place's button acts on that place: a send opens the picker of the character it takes, a claim or a recall
// Acts on the place at once
const act = () => {
  if (detail.actionKind === ExpeditionActionKind.Send) picking.value = true;
  else if (detail.actionKind === ExpeditionActionKind.Claim) emit("claim", detail.id);
  else emit("recall", detail.id);
};
</script>

<template>
  <GameButton class="action" :kind="GameButtonKind.Row" tip="" @click="act()">
    <span class="ring" aria-hidden="true" />
    <span>{{ detail.actionLabel }}</span>
  </GameButton>
</template>

<style scoped>
/* The button is a cream pill 307 by 64, its disc and ring at its left, the words set in the game's dark ink */
.action {
  position: absolute;
  top: calc(var(--unit) * 988);
  left: calc(var(--unit) * 1570);
  display: flex;
  width: calc(var(--unit) * 307);
  height: calc(var(--unit) * 64);
  align-items: center;
  gap: calc(var(--unit) * 3);
  padding: 0 0 0 calc(var(--unit) * 12);
  border: none;
  border-radius: calc(var(--unit) * 32);
  background: #ece4d8;
  color: #2c313d;
  font: inherit;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 0.6);
}

/* The disc is 42 across with a gold ring of 22 inside it, both measured from the reference's button */
.ring {
  position: relative;
  width: calc(var(--unit) * 42);
  height: calc(var(--unit) * 42);
  flex: none;
  border-radius: 50%;
  background: #2e3030;
}

.ring::before {
  position: absolute;
  top: calc(var(--unit) * 10);
  left: calc(var(--unit) * 10);
  width: calc(var(--unit) * 22);
  height: calc(var(--unit) * 22);
  border: calc(var(--unit) * 3) solid #f2c84e;
  border-radius: 50%;
  box-sizing: border-box;
  content: "";
}
</style>
