<script setup lang="ts">
import type { Element } from "#src/models/Element";
import type { GcgDieFace } from "#src/models/gcg/GcgDieFace";

import GcgScreenDie from "#src/components/Gcg/Screen/Die/Index.vue";

interface Props {
  // The side's dice this round, each showing one face: one of the seven elements, or Omni
  dice: (Element | GcgDieFace)[];
  // The dice a Toss-Up being played has taken as its payment
  paidDiceIndices: number[];
  // The dice the player has picked to pay or reroll with
  selectedDieIndices: number[];
}

const { dice, paidDiceIndices, selectedDieIndices } = defineProps<Props>();
const emit = defineEmits<{ select: [dieIndex: number] }>();
// Each die's face and lit flag, worked out once for the column rather than on every row of every render
const dieItems = computed(() =>
  dice.map((face, index) => ({
    face,
    isSelected: selectedDieIndices.includes(index) || paidDiceIndices.includes(index),
  })),
);
</script>

<template>
  <!-- The dice down the board's right edge, the count of them above -->
  <div class="dice-column">
    <span class="dice-count">{{ dice.length }}</span>
    <GcgScreenDie
      v-for="(item, index) in dieItems"
      :key="index"
      :face="item.face"
      :is-selected="item.isSelected"
      @select="emit('select', index)"
    />
  </div>
</template>

<style scoped>
.dice-column {
  position: absolute;
  top: calc(var(--unit) * 107);
  right: calc(var(--unit) * 26);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 5);
}

.dice-count {
  display: grid;
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  margin-bottom: calc(var(--unit) * 14);
  place-items: center;
  border: calc(var(--unit) * 4) solid #e8c060;
  border-radius: 50%;
  background: #917254;
  color: #fff;
  font-size: calc(var(--unit) * 30);
  font-weight: 700;
}
</style>
