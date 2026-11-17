<script setup lang="ts">
import { stepTimeDialAdvance } from "#src/services/menu/stepTimeDialAdvance";
import { MINUTES_PER_DAY } from "genshin-engine";

interface Props {
  // The world's clock minute of the day, which the hour hand stands at
  clockMinutes: number;
  // The minute the advance targets, which the pointer hand stands at
  targetMinutes: number;
}

// How far the pointer has dialled the advance, in minutes, which the screen counts the target from
const advance = defineModel<number>({ required: true });
defineProps<Props>();
const dial = useTemplateRef("dial");
let pointerAngle: number | undefined;
// The dial turns the day as the game draws it: noon at the top, midnight at the bottom, clockwise through the day
const toDialAngle = (minutes: number): number => ((minutes / MINUTES_PER_DAY) * 360 + 180) % 360;
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
</script>

<template>
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
      <g :transform="`rotate(${toDialAngle(clockMinutes)})`">
        <path class="hand current" d="M 0 10 V -86" />
      </g>
      <g :transform="`rotate(${toDialAngle(targetMinutes)})`">
        <path class="hand" d="M 0 0 V -66" />
        <polygon points="-19,-60 3,-109 25,-61 3,-72" fill="#efe9dc" />
      </g>
      <circle class="hub" r="17" />
      <circle r="5" fill="#efe9dc" />
    </svg>
  </div>
</template>

<style scoped>
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
</style>
