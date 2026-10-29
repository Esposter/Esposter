<script setup lang="ts">
import type { GameText } from "genshin-text";

import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import { ScreenHeaderMark } from "#src/models/menu/ScreenHeaderMark";
import { getTimeTargetMinutes } from "#src/services/menu/getTimeTargetMinutes";
import { stepTimeDialAdvance } from "#src/services/menu/stepTimeDialAdvance";
import { MINUTES_PER_DAY } from "genshin-engine";
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The world's clock minute of the day, which stays where it is while the screen is open, as the menus hold the clock
  clockMinutes: number;
  // The game's words in the reader's language
  gameText: GameText;
}

const { clockMinutes, gameText } = defineProps<Props>();
const emit = defineEmits<{ close: []; confirm: [minutes: number] }>();
// The two ornaments the dial's frame carries, at its top and at its bottom
const ORNAMENT_POSITIONS = ["top", "bottom"];
const dial = useTemplateRef("dial");
const confirmButton = useTemplateRef("confirmButton");
// How far the pointer has dialled the advance, from none, and the angle it was at about the dial's centre while held
const advance = ref(0);
let pointerAngle: number | undefined;
const targetMinutes = computed(() => getTimeTargetMinutes(clockMinutes, advance.value));
// The dial turns the day as the game draws it: noon at the top, midnight at the bottom, clockwise through the day
const toDialAngle = (minutes: number): number => ((minutes / MINUTES_PER_DAY) * 360 + 180) % 360;
const currentAngle = computed(() => toDialAngle(clockMinutes));
const targetAngle = computed(() => toDialAngle(targetMinutes.value));
const formatMinutes = (minutes: number): string => {
  const wholeMinutes = Math.floor(minutes);
  return Temporal.PlainTime.from({ hour: Math.floor(wholeMinutes / 60), minute: wholeMinutes % 60 }).toString({
    smallestUnit: "minute",
  });
};
const clockTime = computed(() => formatMinutes(clockMinutes));
const targetTime = computed(() => formatMinutes(targetMinutes.value));
// The pointer's angle about the dial's centre, which a drag steps the advance by as it turns round the dial
const getPointerAngle = (event: PointerEvent, element: HTMLElement): number => {
  const { height, left, top, width } = element.getBoundingClientRect();
  return Math.atan2(event.clientY - (top + height / 2), event.clientX - (left + width / 2));
};
const onDialPointerDown = (event: PointerEvent) => {
  if (!dial.value) return;
  dial.value.setPointerCapture(event.pointerId);
  pointerAngle = getPointerAngle(event, dial.value);
};
const onDialPointerMove = (event: PointerEvent) => {
  if (pointerAngle === undefined || !dial.value) return;
  const angle = getPointerAngle(event, dial.value);
  advance.value = stepTimeDialAdvance(advance.value, pointerAngle, angle);
  pointerAngle = angle;
};
const onDialPointerUp = () => {
  pointerAngle = undefined;
};
// The screen is a full screen over the world, so focus starts on the screen's one action, which is the way forward
onMounted(() => {
  confirmButton.value?.focus();
});
</script>

<template>
  <!-- The Time screen the Paimon menu's side bar opens: its title and the cross that closes it, the clock's dial on the
       right of the screen and, in the middle, the clock's time and the hour the dial points at, then Confirm, which sets
       the world's clock to that hour. The dial and the column are placed from the English PC client's screen (1080 high,
       a reference pixel a unit). "Current Time" and "Today" have no game text key yet, so they are not drawn -->
  <GameScreen class="menu-time" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Time]">
    <ScreenHeader
      :game-text
      :mark="ScreenHeaderMark.TracedCross"
      :title="gameText[GameTextKey.Time]"
      @close="emit('close')"
    />
    <div
      ref="dial"
      class="dial"
      @pointerdown="(event) => onDialPointerDown(event)"
      @pointermove="(event) => onDialPointerMove(event)"
      @pointerup="onDialPointerUp()"
      @pointercancel="onDialPointerUp()"
    >
      <svg class="face" viewBox="-230 -230 460 460" aria-hidden="true">
        <defs>
          <linearGradient id="menu-time-arc" x1="-122" x2="122" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#e9d96a" />
            <stop offset="0.5" stop-color="#f7edc0" />
            <stop offset="0.85" stop-color="#f4a77a" />
            <stop offset="1" stop-color="#e2584a" />
          </linearGradient>
        </defs>
        <circle class="frame" r="195" />
        <circle class="centre" r="118" />
        <circle class="ticks" r="126" />
        <path class="arc" d="M -122 0 A 122 122 0 0 1 122 0" stroke="url(#menu-time-arc)" />
        <path class="arc" d="M -86.3 86.3 A 122 122 0 0 1 -117.8 31.6" stroke="#3fd0a0" />
        <circle class="badge" cx="0" cy="-200" r="30" />
        <circle cx="0" cy="-200" r="14" fill="#c9cacd" />
        <circle class="badge" cx="0" cy="200" r="30" />
        <circle cx="0" cy="200" r="15" fill="#8ccfff" />
        <circle cx="7" cy="196" r="13" fill="#262b40" />
        <circle class="badge" cx="-200" cy="0" r="30" />
        <path d="M -216 0 A 16 16 0 0 1 -184 0 Z" fill="#feffaa" />
        <circle class="badge" cx="200" cy="0" r="30" />
        <path d="M 188 0 A 12 12 0 0 1 212 0 Z" fill="#919397" />
        <circle class="marker" cx="0" cy="-138" r="9" fill="#ebe3d7" />
        <circle class="marker" cx="0" cy="138" r="9" fill="none" stroke-width="2" />
        <circle class="marker" cx="-138" cy="0" r="9" />
        <path d="M -147 0 A 9 9 0 0 1 -129 0 Z" fill="#ebe3d7" />
        <circle class="marker" cx="138" cy="0" r="9" />
        <path d="M 129 0 A 9 9 0 0 1 147 0 Z" fill="#ebe3d7" />
        <g :transform="`rotate(${currentAngle})`">
          <path class="hand current" d="M 0 10 V -86" />
        </g>
        <g :transform="`rotate(${targetAngle})`">
          <path class="hand" d="M 0 10 V -98" />
          <polygon points="-9,-96 0,-118 9,-96" fill="#efe9dc" />
        </g>
        <circle class="hub" r="17" />
        <circle r="5" fill="#efe9dc" />
      </svg>
    </div>
    <svg
      v-for="position of ORNAMENT_POSITIONS"
      :key="position"
      :class="['ornament', position]"
      viewBox="0 0 70 24"
      aria-hidden="true"
    >
      <path d="M 2 18 L 22 8 L 29 12 M 68 18 L 48 8 L 41 12" fill="none" />
      <path d="M 35 2 L 41 12 L 35 22 L 29 12 Z" fill="#c6b794" />
    </svg>
    <p class="clock-time">{{ clockTime }}</p>
    <span class="caret first" />
    <p class="wait-until">{{ gameText[GameTextKey.TimeWaitUntil] }}</p>
    <span class="caret second" />
    <p class="hour">{{ targetTime }}</p>
    <GameButton
      ref="confirmButton"
      class="confirm"
      tip=""
      :kind="GameButtonKind.Pill"
      @click="emit('confirm', targetMinutes)"
    >
      {{ gameText[GameTextKey.TimeConfirm] }}
    </GameButton>
  </GameScreen>
</template>

<style scoped>
.menu-time {
  --reference-pixel: var(--unit);
  color: #ece5d8;
}

/* The dial's centre at 445 reference pixels right of the screen's middle, 505 down, its ring and badges within 460 */
.dial {
  position: absolute;
  top: calc(var(--reference-pixel) * 505);
  left: calc(50% + var(--reference-pixel) * 445);
  width: calc(var(--reference-pixel) * 460);
  height: calc(var(--reference-pixel) * 460);
  cursor: grab;
  touch-action: none;
  translate: -50% -50%;
}

.face {
  display: block;
  width: 100%;
  height: 100%;
}

.frame {
  fill: none;
  stroke: rgb(200 190 150 / 0.3);
  stroke-width: 2;
}

.centre {
  fill: #120e12;
  fill-opacity: 0.8;
}

.ticks {
  fill: none;
  stroke: #d9d3c4;
  stroke-dasharray: 0 33;
  stroke-linecap: round;
  stroke-width: 3;
}

.arc {
  fill: none;
  stroke-width: 6;
}

.badge {
  fill: #23283a;
  stroke: #5d5b52;
  stroke-width: 2;
}

.marker {
  fill: #1d2230;
  stroke: #ebe3d7;
  stroke-width: 2;
}

.hand {
  fill: none;
  stroke: #efe9dc;
  stroke-linecap: round;
  stroke-width: 6;
}

.hand.current {
  stroke-width: 5;
}

.hub {
  fill: #1a1d27;
  stroke: #efe9dc;
  stroke-width: 4;
}

.ornament {
  position: absolute;
  left: 50%;
  width: calc(var(--reference-pixel) * 70);
  height: calc(var(--reference-pixel) * 24);
  stroke: #c6b794;
  stroke-width: 1.6;
  translate: -50% -50%;
}

.ornament.top {
  top: calc(var(--reference-pixel) * 337);
}

.ornament.bottom {
  top: calc(var(--reference-pixel) * 645);
}

.clock-time,
.wait-until,
.hour {
  position: absolute;
  left: 50%;
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  translate: -50% -50%;
}

.clock-time {
  top: calc(var(--reference-pixel) * 450);
  color: #f3efe6;
  font-size: calc(var(--reference-pixel) * 28);
}

.wait-until {
  top: calc(var(--reference-pixel) * 507);
  color: #c9b994;
  font-size: calc(var(--reference-pixel) * 19);
}

.hour {
  top: calc(var(--reference-pixel) * 570);
  color: #f3efe6;
  font-size: calc(var(--reference-pixel) * 28);
}

.caret {
  position: absolute;
  left: 50%;
  width: 0;
  height: 0;
  border-top: calc(var(--reference-pixel) * 5) solid #8f8f8f;
  border-inline: calc(var(--reference-pixel) * 4) solid transparent;
  translate: -50% -50%;
}

.caret.first {
  top: calc(var(--reference-pixel) * 476);
}

.caret.second {
  top: calc(var(--reference-pixel) * 539);
}

.confirm {
  position: absolute;
  top: calc(var(--reference-pixel) * 880);
  left: 50%;
  width: calc(var(--reference-pixel) * 300);
  height: calc(var(--reference-pixel) * 72);
  translate: -50% 0;
}
</style>
