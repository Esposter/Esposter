<script setup lang="ts">
import CloseButton from "#src/components/CloseButton/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
import {
  COOKING_ARC_CENTRE_X,
  COOKING_ARC_CENTRE_Y,
  COOKING_ARC_RADIUS_X,
  COOKING_ZONE_RADIUS_Y,
} from "#src/services/constants";

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
  // The indicator's zones as fractions of its bar from the left end: the Delicious zone lies within the Regular one
  zones: { delicious: [number, number]; regular: [number, number] };
}

const { autoCookLabel, closeLabel, dishes, isAutoCookable, pointer, selectedId, stopLabel, title, zones } =
  defineProps<Props>();
const emit = defineEmits<{ autoCook: []; close: []; select: [id: number]; stop: [] }>();

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
const pointerPosition = computed(() => toArcPoint(pointer, COOKING_ZONE_RADIUS_Y));
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
        <!-- The pot's wall, dark at its mouth and warm where the fire lights its foot, as the recording shows it -->
        <linearGradient id="cooking-pot" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.35" stop-color="rgb(58 59 65)" />
          <stop offset="0.55" stop-color="rgb(86 85 89)" />
          <stop offset="0.85" stop-color="rgb(120 108 100)" />
          <stop offset="1" stop-color="rgb(170 138 112)" />
        </linearGradient>
      </defs>
      <ellipse class="heat" cx="960" cy="700" rx="100" ry="260" />
      <!-- The flame under the pot, drawn before the pot so the pot's bottom covers its top -->
      <path
        class="flame"
        d="M800 470 C830 440 860 470 880 455 C905 430 930 470 960 445 C990 470 1020 430 1040 455 C1070 440 1100 470 1118 470 C1090 500 1050 512 1010 520 L960 526 L910 520 C870 512 830 500 800 470 Z"
      />
      <ellipse class="flame-core" cx="960" cy="492" rx="90" ry="14" />
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
      <!-- The bar's outer arc, its inner arc, the tick dots above it and the two scrolls at its ends, measured off the recording -->
      <path class="track" d="M525 834 A525 265 0 0 1 1395 834" />
      <path class="inner-track" d="M690 832 A345 198 0 0 1 1230 832" />
      <path
        class="scroll"
        d="M525 828 C534 810 555 810 564 822 S588 819 600 807 S630 795 642 786 S660 768 678 768 C690 768 699 750 687 744 C678 739.5 672 750 681 759 M1395 828 C1386 810 1365 810 1356 822 S1332 819 1320 807 S1290 795 1278 786 S1260 768 1242 768 C1230 768 1221 750 1233 744 C1242 739.5 1248 750 1239 759"
      />
      <g class="ticks">
        <circle cx="815" cy="719" r="3" />
        <circle cx="885" cy="708" r="3" />
        <circle cx="960" cy="702" r="3" />
        <circle cx="1035" cy="708" r="3" />
        <circle cx="1105" cy="720" r="3" />
        <circle cx="1173" cy="735" r="3" />
      </g>
      <path class="regular" :d="toArcPath(zones.regular, COOKING_ZONE_RADIUS_Y)" />
      <path class="delicious" :d="toArcPath(zones.delicious, COOKING_ZONE_RADIUS_Y)" />
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
  fill: #64666d;
}

.pot {
  fill: url(#cooking-pot);
}

.pot-rim {
  fill: #948f88;
}

.pot-opening {
  fill: #3a3b41;
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
  fill: #eea44c;
}

.flame-core {
  fill: #ffde96;
}

.track,
.inner-track,
.scroll {
  fill: none;
  stroke: rgb(250 248 236 / 95%);
}

.track,
.inner-track {
  stroke-width: 4;
}

.scroll {
  stroke-linecap: round;
  stroke-width: 3;
}

.ticks circle {
  fill: rgb(250 248 236);
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
