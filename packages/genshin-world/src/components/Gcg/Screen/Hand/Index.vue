<script setup lang="ts">
import type { GcgCard } from "#src/models/gcg/GcgCard";

import GcgScreenCard from "#src/components/Gcg/Screen/Card/Index.vue";

interface Props {
  // The hand card the player has armed to play onto a Character, by its hand index
  armedHandIndex?: number;
  // The side's hand, its cards in the order it holds them
  cards: GcgCard[];
  // The Toss-Up card being played, by its hand index
  rerollHandIndex?: number;
  // The cards the player has picked to switch away in preparation, by their hand index
  switchedHandIndices: number[];
  // The names of the hand's cards in the reader's language, by their game text ids
  textMap: Readonly<Record<string, string>>;
}

const { armedHandIndex, cards, rerollHandIndex, switchedHandIndices, textMap } = defineProps<Props>();
const emit = defineEmits<{ select: [handIndex: number] }>();
</script>

<template>
  <!-- The hand fanned along the bottom of the board, each card lit as the choice it stands for is. The dice cost has no
       GameTextKey yet, so its number is read alone -->
  <div class="hand">
    <GcgScreenCard
      v-for="(card, index) in cards"
      :key="index"
      cost-label=""
      :costs="card.costs"
      :is-selected="armedHandIndex === index || rerollHandIndex === index || switchedHandIndices.includes(index)"
      :name="textMap[card.nameTextId] ?? ''"
      @select="emit('select', index)"
    />
  </div>
</template>

<style scoped>
/* The hand's cards step 83.75 apart across the frame's five, the first at 694 */
.hand {
  position: absolute;
  top: calc(var(--unit) * 974);
  left: calc(var(--unit) * 694);
  display: flex;
  align-items: flex-end;
}

.hand > * + * {
  margin-left: calc(var(--unit) * -91.25);
}
</style>
