<script setup lang="ts">
import type { Element } from "#src/models/Element";
import type { GcgAura } from "#src/models/gcg/GcgAura";

interface Props {
  // The aura the character holds: an element, or none
  aura: Element | GcgAura;
  // The energy it holds toward its burst, and the most it can hold
  energy: number;
  hp: number;
  // Whether a click on it does something for the player at this moment
  isChoosable?: boolean;
  // The character's name in the reader's language
  maxEnergy: number;
  name: string;
  // The shield points it holds
  shield: number;
}

const { aura, energy, hp, isChoosable, maxEnergy, name, shield } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <!-- A character card on the board: its HP in the corner, its energy as pips down its right edge, its aura and shield
       beside it and its name under them. A defeated one is greyed; the board raises the active one by its class -->
  <button
    :aria-label="name"
    class="character"
    :class="{ choosable: isChoosable, defeated: hp <= 0 }"
    type="button"
    @click="emit('select')"
  >
    <span class="hp">{{ hp }}</span>
    <span class="energy">
      <span v-for="pip in maxEnergy" :key="pip" class="pip" :class="{ full: pip <= energy }" />
    </span>
    <span class="aura" :data-aura="aura" />
    <span v-if="shield > 0" class="shield">{{ shield }}</span>
  </button>
</template>

<style scoped>
/* The card's art is not drawn: its plate is the mean colour of the six cards' art in the frame, and its frame is the cream
   border the game draws. The game shows no name on a card in this frame, so the name is only the button's label */
.character {
  position: absolute;
  width: calc(var(--unit) * 165);
  height: calc(var(--unit) * 284);
  padding: 0;
  border: calc(var(--unit) * 3) solid #e6dcc6;
  border-radius: calc(var(--unit) * 10);
  background: #8e8593;
  box-shadow: 0 calc(var(--unit) * 2) calc(var(--unit) * 6) rgb(0 0 0 / 0.35);
  color: #f5ecd6;
  cursor: inherit;
  font: inherit;
  transition: transform 160ms;
}

.character.choosable:hover,
.character.choosable:focus-visible {
  box-shadow: 0 0 0 calc(var(--unit) * 3) #f6e3a1;
}

.character.defeated {
  filter: grayscale(1) brightness(0.6);
}

.hp {
  position: absolute;
  top: calc(var(--unit) * 7);
  left: calc(var(--unit) * -17);
  display: grid;
  width: calc(var(--unit) * 50);
  height: calc(var(--unit) * 50);
  place-items: center;
  border: calc(var(--unit) * 3) solid #d9b061;
  border-radius: 50%;
  background: #f5eedd;
  color: #2a2a2a;
  font-size: calc(var(--unit) * 30);
  font-weight: 700;
}

.energy {
  position: absolute;
  top: calc(var(--unit) * 80);
  right: calc(var(--unit) * -10);
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 4);
}

.pip {
  width: calc(var(--unit) * 10);
  height: calc(var(--unit) * 10);
  background: #3a3a3a;
  transform: rotate(45deg);
}

.pip.full {
  background: #f2c94c;
}

.aura {
  position: absolute;
  top: calc(var(--unit) * 40);
  right: calc(var(--unit) * -18);
  width: calc(var(--unit) * 28);
  height: calc(var(--unit) * 28);
  border-radius: 50%;
}

.aura[data-aura="Fire"] {
  background: #e0532c;
}

.aura[data-aura="Water"] {
  background: #3b86d6;
}

.aura[data-aura="Wind"] {
  background: #47c9a8;
}

.aura[data-aura="Electric"] {
  background: #9a62d8;
}

.aura[data-aura="Grass"] {
  background: #8cc640;
}

.aura[data-aura="Ice"] {
  background: #8fd8f2;
}

.aura[data-aura="Rock"] {
  background: #d9a441;
}

.shield {
  position: absolute;
  top: calc(var(--unit) * 80);
  left: calc(var(--unit) * -12);
  padding: calc(var(--unit) * 2) calc(var(--unit) * 8);
  border-radius: calc(var(--unit) * 10);
  background: #d9c9a0;
  color: #2a2a2a;
  font-size: calc(var(--unit) * 18);
}
</style>
