<script setup lang="ts">
import {
  COOKING_ARC_CENTRE_X,
  COOKING_ARC_CENTRE_Y,
  COOKING_ARC_RADIUS_X,
  COOKING_ARC_RADIUS_Y,
} from "#src/services/constants";
import { computed } from "vue";

interface Props {
  // The Auto Cook button's label in the reader's language
  autoCookLabel: string;
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
  // The indicator's zones as fractions of its bar from the left end: the Delicious zone lies within the Regular one
  zones: { delicious: [number, number]; regular: [number, number] };
}

const { autoCookLabel, dishes, isAutoCookable, pointer, selectedId, stopLabel, title, zones } = defineProps<Props>();
const emit = defineEmits<{ autoCook: []; close: []; select: [id: number]; stop: [] }>();
// The zones lie on a band drawn inside the bar's track, whose radius is this, in the stage's units
const ZONE_RADIUS_Y = 90;

const toArcPoint = (fraction: number, radiusY: number) => {
  const angle = Math.PI * (1 - Math.min(1, Math.max(0, fraction)));
  return {
    x: COOKING_ARC_CENTRE_X + COOKING_ARC_RADIUS_X * Math.cos(angle),
    y: COOKING_ARC_CENTRE_Y - radiusY * Math.sin(angle),
  };
};
const toArcPath = ([start, end]: [number, number], radiusY: number) => {
  const from = toArcPoint(start, radiusY);
  const to = toArcPoint(end, radiusY);
  return `M ${from.x} ${from.y} A ${COOKING_ARC_RADIUS_X} ${radiusY} 0 0 1 ${to.x} ${to.y}`;
};
const pointerPosition = computed(() => toArcPoint(pointer, ZONE_RADIUS_Y));
</script>

<template>
  <div class="cooking-screen">
    <svg aria-hidden="true" class="chef" viewBox="0 0 54 50">
      <path d="M11 24 C3 23 3 11 12 11 C11 2 25 0 27 8 C30 0 44 2 42 11 C51 11 51 23 43 24 L43 41 L11 41 Z" />
    </svg>
    <p class="title" role="heading" aria-level="1">{{ title }}</p>
    <button class="close" type="button" @click="emit('close')">×</button>
    <ul v-if="dishes.length > 1" class="dishes">
      <li v-for="dish in dishes" :key="dish.id">
        <button
          :aria-pressed="dish.id === selectedId"
          :class="{ selected: dish.id === selectedId }"
          type="button"
          @click="emit('select', dish.id)"
        >
          {{ dish.name }}
        </button>
      </li>
    </ul>
    <svg aria-hidden="true" class="stage" viewBox="0 0 1920 1080">
      <defs>
        <radialGradient id="cooking-heat">
          <stop offset="0" stop-color="rgb(214 52 34 / 42%)" />
          <stop offset="1" stop-color="rgb(214 52 34 / 0%)" />
        </radialGradient>
      </defs>
      <ellipse class="heat" cx="960" cy="700" rx="100" ry="260" />
      <!-- The flame under the pot, drawn before the pot so the pot's bottom covers its top -->
      <path
        class="flame"
        d="M800 470 C830 440 860 470 880 455 C905 430 930 470 960 445 C990 470 1020 430 1040 455 C1070 440 1100 470 1118 470 C1090 505 1050 520 1010 530 L960 540 L910 530 C870 520 830 505 800 470 Z"
      />
      <ellipse class="flame-core" cx="960" cy="492" rx="90" ry="16" />
      <!-- The pot, with its rim, handles, and the three ingredients in it -->
      <path class="handle" d="M716 330 L790 330 L790 352 L716 352 Z M1130 330 L1204 330 L1204 352 L1130 352 Z" />
      <path class="pot" d="M780 345 C790 440 860 492 960 496 C1060 492 1130 440 1140 345 Z" />
      <ellipse class="pot-rim" cx="960" cy="345" rx="180" ry="39" />
      <ellipse class="pot-opening" cx="960" cy="345" rx="160" ry="30" />
      <ellipse class="carrot" cx="855" cy="352" rx="28" ry="18" />
      <rect class="jar" height="78" rx="8" width="60" x="930" y="316" />
      <rect class="jar-cap" height="16" width="46" x="937" y="304" />
      <ellipse class="meat" cx="1055" cy="356" rx="56" ry="26" />
      <!-- The bar: its track, and the regular and delicious zones on the band inside it -->
      <path class="track" :d="toArcPath([0, 1], COOKING_ARC_RADIUS_Y)" />
      <path class="regular" :d="toArcPath(zones.regular, ZONE_RADIUS_Y)" />
      <path class="delicious" :d="toArcPath(zones.delicious, ZONE_RADIUS_Y)" />
      <g class="pointer" :transform="`translate(${pointerPosition.x} ${pointerPosition.y}) rotate(-17)`">
        <rect height="44" rx="14" width="36" x="-18" y="-48" />
        <path d="M-6 -8 L6 -8 L5 66 L-5 66 Z" />
      </g>
    </svg>
    <button v-if="isAutoCookable" class="auto-cook" type="button" @click="emit('autoCook')">
      {{ autoCookLabel }}
    </button>
    <button class="stop" type="button" @click="emit('stop')">
      <span class="stop-disc" aria-hidden="true"><span class="stop-square" /></span>
      <span class="stop-label">{{ stopLabel }}</span>
    </button>
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

.stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.heat {
  fill: url(#cooking-heat);
}

.handle {
  fill: #7d7f88;
}

.pot {
  fill: #4a4c57;
}

.pot-rim {
  fill: #8d9199;
}

.pot-opening {
  fill: #3b3e47;
}

.carrot {
  fill: #e8762b;
}

.jar {
  fill: rgb(220 230 236 / 90%);
}

.jar-cap {
  fill: #7a5530;
}

.meat {
  fill: #d9473c;
}

.flame {
  fill: #e8801c;
}

.flame-core {
  fill: #ffb43c;
}

.track {
  fill: none;
  stroke: rgb(240 236 225 / 85%);
  stroke-width: 3;
}

.regular {
  fill: none;
  stroke: #f1e7bd;
  stroke-width: 30;
}

.delicious {
  fill: none;
  stroke: #f5a623;
  stroke-width: 30;
}

.pointer {
  fill: #ffffff;
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
  top: calc(var(--unit) * 26);
  left: calc(var(--unit) * 145);
  margin: 0;
  color: #e2cf9b;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  line-height: 1;
}

.close {
  position: absolute;
  top: calc(var(--unit) * 20);
  right: calc(var(--unit) * 54);
  width: calc(var(--unit) * 57);
  height: calc(var(--unit) * 57);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgb(235 235 235 / 90%);
  color: #2a2a2a;
  font-size: calc(var(--unit) * 34);
  line-height: 1;
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
  color: #ece3d8;
  font-size: calc(var(--unit) * 24);
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
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 40);
  border-radius: calc(var(--unit) * 6);
  background: #e8c46a;
}
</style>
