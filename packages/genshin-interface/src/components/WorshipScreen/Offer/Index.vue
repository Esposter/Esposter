<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The count of the Oculi held, which the Offer pills are disabled over when none is
  heldCount: number;
  // The words on the Offer All pill, which offers every Oculus held at once
  offerAllLabel: string;
  // The words on the Offer pill, which offers the Oculi held one at a time
  offerLabel: string;
  // The line set over the count of the Oculi held
  ownedLabel: string;
}

defineProps<Props>();
const emit = defineEmits<{ offer: [] }>();
</script>

<template>
  <div class="requirement">
    <span class="requirement-icon" aria-hidden="true" />
    <span class="owned-label">{{ ownedLabel }}</span>
    <span class="owned">× {{ heldCount }}</span>
    <span class="help" aria-hidden="true">?</span>
  </div>
  <GameButton class="offer" :disabled="heldCount === 0" :kind="GameButtonKind.Pill" tip="" @click="emit('offer')">
    <span class="offer-icon" aria-hidden="true" />
    <span class="offer-label">{{ offerLabel }}</span>
  </GameButton>
  <GameButton class="offer-all" :disabled="heldCount === 0" :kind="GameButtonKind.Pill" tip="" @click="emit('offer')">
    <span class="offer-icon" aria-hidden="true" />
    <span class="offer-label">{{ offerAllLabel }}</span>
  </GameButton>
</template>

<style scoped>
.requirement {
  position: absolute;
  top: calc(var(--unit) * 874);
  left: calc(var(--unit) * 40);
  width: calc(var(--unit) * 536);
  height: calc(var(--unit) * 85);
  background: #cdc5b2;
}

.requirement-icon {
  position: absolute;
  top: calc(var(--unit) * 10);
  left: calc(var(--unit) * 11);
  width: calc(var(--unit) * 65);
  height: calc(var(--unit) * 65);
  background: #7b7566;
}

.owned,
.owned-label {
  position: absolute;
  left: calc(var(--unit) * 100);
  color: #5f5b4f;
  font-weight: 600;
}

.owned-label {
  top: calc(var(--unit) * 9);
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 26);
}

.owned {
  top: calc(var(--unit) * 34);
  font-size: calc(var(--unit) * 30);
  line-height: calc(var(--unit) * 40);
}

.help {
  position: absolute;
  top: calc(var(--unit) * 23);
  left: calc(var(--unit) * 478);
  display: grid;
  width: calc(var(--unit) * 38);
  height: calc(var(--unit) * 38);
  place-items: center;
  border-radius: 50%;
  background: #ebe6da;
  color: #32352c;
  font-size: calc(var(--unit) * 26);
  font-weight: 700;
  line-height: 1;
}

.offer,
.offer-all {
  position: absolute;
  top: calc(var(--unit) * 991);
  height: calc(var(--unit) * 58);
}

.offer {
  left: calc(var(--unit) * 40);
  width: calc(var(--unit) * 214);
}

.offer-all {
  left: calc(var(--unit) * 307);
  width: calc(var(--unit) * 268);
}

.offer:disabled,
.offer-all:disabled {
  opacity: 0.4;
}

.offer-icon {
  position: absolute;
  top: calc(var(--unit) * 8);
  left: calc(var(--unit) * 8);
  width: calc(var(--unit) * 42);
  height: calc(var(--unit) * 42);
  border-radius: 50%;
  background: #d9c58f;
}

.offer-all .offer-icon {
  left: calc(var(--unit) * 7);
}

/* Positioned, so the words show over the pill's press light, and drawn at three quarters of the pill's opacity, which fits
   the faint words of the reference's disabled pills */
.offer-label {
  position: absolute;
  top: calc(var(--unit) * 16);
  left: calc(var(--unit) * 84);
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  line-height: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 4);
  white-space: nowrap;
  opacity: 0.75;
}
</style>
