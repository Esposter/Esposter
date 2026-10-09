<script setup lang="ts">
interface Props {
  // The dice the card costs to play, the energy it takes left out
  diceCount: number;
  isSelected?: boolean;
  // The card's name in the reader's language
  name: string;
}

const { diceCount, isSelected, name } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <!-- A card of a side's hand, fanned along the bottom of the board by its hand's row, its dice cost in the corner. A
       chosen card lifts -->
  <button class="card" :class="{ selected: isSelected }" type="button" @click="emit('select')">
    <span class="cost">{{ diceCount }}</span>
    <span class="name">{{ name }}</span>
  </button>
</template>

<style scoped>
/* Provisional: a card's art and frame wait on the parity pass, as the board's do */
.card {
  position: relative;
  flex: none;
  width: calc(var(--unit) * 128);
  height: calc(var(--unit) * 200);
  padding: 0;
  border: calc(var(--unit) * 2) solid #d9c28a;
  border-radius: calc(var(--unit) * 10);
  background: linear-gradient(180deg, #f3ead2 0%, #d8c8a0 100%);
  box-shadow: 0 calc(var(--unit) * 4) calc(var(--unit) * 10) rgb(0 0 0 / 0.4);
  color: #2a2a2a;
  cursor: inherit;
  font: inherit;
  transition: transform 140ms;
}

.card.selected {
  transform: translateY(calc(var(--unit) * -30));
}

.cost {
  position: absolute;
  top: calc(var(--unit) * 8);
  left: calc(var(--unit) * 8);
  display: grid;
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  place-items: center;
  border-radius: 50%;
  background: #4b6fa8;
  color: #fff;
  font-size: calc(var(--unit) * 20);
  font-weight: 700;
}

.name {
  position: absolute;
  right: calc(var(--unit) * 8);
  bottom: calc(var(--unit) * 14);
  left: calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 18);
  font-weight: 600;
  text-align: center;
}
</style>
