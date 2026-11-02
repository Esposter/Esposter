<script setup lang="ts">
import type { CookingZones } from "#src/models/CookingZones";

import CloseButton from "#src/components/CloseButton/Index.vue";
import CookingScreenStage from "#src/components/CookingScreen/Stage/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The Auto Cook button's label in the reader's language
  autoCookLabel: string;
  // The way out of the screen, named for a screen reader in the reader's language
  closeLabel: string;
  // The dishes the cook knows, by id and name in the reader's language, listed for the choice
  dishes: { id: number; name: string }[];
  // Whether Auto Cook is offered for the dish on the screen, once its proficiency is full
  isAutoCookable: boolean;
  // The place of the pointer along the bar, as a fraction from its left end
  pointer: number;
  // The id of the dish on the screen, which the list marks
  selectedId: number;
  // The Stop button's label in the reader's language
  stopLabel: string;
  // The title the game shows at the top left
  title: string;
  // The indicator's zones as fractions of its bar from the left end
  zones: CookingZones;
}

const { autoCookLabel, closeLabel, dishes, isAutoCookable, pointer, selectedId, stopLabel, title, zones } =
  defineProps<Props>();
const emit = defineEmits<{ autoCook: []; close: []; select: [id: number]; stop: [] }>();
</script>

<template>
  <div class="cooking-screen">
    <svg aria-hidden="true" class="chef" viewBox="3 0 48 50">
      <path d="M11 24 C3 23 3 11 12 11 C11 2 25 0 27 8 C30 0 44 2 42 11 C51 11 51 23 43 24 L43 50 L11 50 Z" />
    </svg>
    <p class="title" role="heading" aria-level="1">{{ title }}</p>
    <CloseButton class="close" :label="closeLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
    <ul v-if="dishes.length > 1" class="dishes">
      <li v-for="dish in dishes" :key="dish.id">
        <GameButton
          :aria-pressed="dish.id === selectedId"
          :class="{ selected: dish.id === selectedId }"
          :kind="GameButtonKind.Row"
          tip=""
          @click="emit('select', dish.id)"
        >
          {{ dish.name }}
        </GameButton>
      </li>
    </ul>
    <CookingScreenStage :pointer :zones />
    <GameButton v-if="isAutoCookable" class="auto-cook" :kind="GameButtonKind.Row" tip="" @click="emit('autoCook')">
      {{ autoCookLabel }}
    </GameButton>
    <GameButton class="stop" :kind="GameButtonKind.Row" tip="" @click="emit('stop')">
      <span class="stop-disc" aria-hidden="true"><span class="stop-square" /></span>
      <span class="stop-label">{{ stopLabel }}</span>
    </GameButton>
  </div>
</template>

<style scoped>
/* The screen's colours are measured off the English client's cooking screen, with the world behind it drawn by the parity page */
.cooking-screen {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.chef {
  position: absolute;
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 52);
  width: calc(var(--unit) * 54);
  height: calc(var(--unit) * 50);
  fill: #d9c48d;
}

.title {
  position: absolute;
  top: calc(var(--unit) * 33);
  left: calc(var(--unit) * 145);
  margin: 0;
  color: #e2cf9b;
  font-size: calc(var(--unit) * 32);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * -1.8);
  line-height: 1;
}

.close {
  top: calc(var(--unit) * 20);
  right: calc(var(--unit) * 53);
  background: rgb(238 236 228);
  box-shadow: inset 0 0 0 calc(var(--unit) * 4.5) rgb(150 150 150);
  color: rgb(45 48 60);
}

.dishes {
  position: absolute;
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 96);
  display: grid;
  gap: calc(var(--unit) * 12);
  margin: 0;
  padding: 0;
  list-style: none;
}

.dishes button {
  width: calc(var(--unit) * 260);
  padding: calc(var(--unit) * 10);
  border: 0;
  background: rgb(255 255 255 / 12%);
  color: #ece3d8;
  font-size: calc(var(--unit) * 20);
  text-align: left;
}

.dishes .selected {
  background: #a154de;
}

.auto-cook {
  position: absolute;
  bottom: calc(var(--unit) * 40);
  left: calc(50% + var(--unit) * 150);
  width: calc(var(--unit) * 180);
  height: calc(var(--unit) * 52);
  transform: translateX(-50%);
  border: 0;
  background: #3a3a44;
  color: #ece3d8;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
}

.stop {
  position: absolute;
  top: calc(var(--unit) * 892);
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 26);
  width: calc(var(--unit) * 160);
  padding: 0;
  transform: translateX(-50%);
  border: 0;
  background: none;
  color: rgb(44 40 36);
  font-size: calc(var(--unit) * 24);
  font-weight: 700;
  line-height: 1;
}

.stop-disc {
  display: grid;
  place-items: center;
  width: calc(var(--unit) * 90);
  height: calc(var(--unit) * 90);
  border: calc(var(--unit) * 4) solid rgb(150 140 120 / 80%);
  border-radius: 50%;
  background: rgb(30 30 34 / 85%);
}

.stop-square {
  width: calc(var(--unit) * 37);
  height: calc(var(--unit) * 37);
  border: calc(var(--unit) * 3) solid rgb(242 234 170);
}
</style>
