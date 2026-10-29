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
  <button :aria-label="name" class="card" :class="{ selected: isSelected }" type="button" @click="emit('select')">
    <span class="cost">{{ diceCount }}</span>
  </button>
</template>

<style scoped>
/* A card's frame is measured off the game's frame at 1080 high: its cream border, and its plate the mean of the hand's
   visible art. Its cost is the game's hexagon, and its name is only the button's label */
.card {
  position: relative;
  flex: none;
  width: calc(var(--unit) * 175);
  height: calc(var(--unit) * 200);
  padding: 0;
  border: calc(var(--unit) * 3) solid #ead7be;
  border-radius: calc(var(--unit) * 10);
  background: #bcb7ac;
  box-shadow: 0 calc(var(--unit) * 2) calc(var(--unit) * 6) rgb(0 0 0 / 0.35);
  color: #fdf3f3;
  cursor: inherit;
  font: inherit;
  transition: transform 140ms;
}

.card.selected {
  transform: translateY(calc(var(--unit) * -30));
}

.cost {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  width: calc(var(--unit) * 46);
  height: calc(var(--unit) * 50);
  place-items: center;
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
  background: #6b6357;
  color: #fdf3f3;
  font-size: calc(var(--unit) * 26);
  font-weight: 700;
  text-shadow: 0 0 calc(var(--unit) * 3) #322d1a;
}
</style>
