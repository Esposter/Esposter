<script setup lang="ts">
import type { ExpeditionPin } from "#src/models/ExpeditionPin";

import { GAME_CREAM } from "#src/services/constants";

interface Props {
  // The places as pins over the map, each at its position in the frame
  pins: ExpeditionPin[];
}

const place = defineModel<number | undefined>("place");
defineProps<Props>();
</script>

<template>
  <ul class="pins">
    <li v-for="{ awayLabel, id, label, x, y } of pins" :key="id" :style="{ '--x': x, '--y': y }">
      <button class="pin" :aria-label="label" :aria-pressed="id === place" type="button" @click="place = id">
        <span class="plus" aria-hidden="true" />
      </button>
      <span v-if="awayLabel" class="away">{{ awayLabel }}</span>
    </li>
  </ul>
</template>

<style scoped>
/* Each pin is a white disc 86 across with a grey rim standing on its place, its point under it, the picked one bracketed at its corners */
.pins {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pins li {
  position: absolute;
  left: calc(var(--unit) * var(--x));
  top: calc(var(--unit) * var(--y));
}

.pin {
  position: absolute;
  top: calc(var(--unit) * -43);
  left: calc(var(--unit) * -43);
  width: calc(var(--unit) * 86);
  height: calc(var(--unit) * 86);
  padding: 0;
  border: calc(var(--unit) * 3) solid #8e9197;
  border-radius: 50%;
  background: #f1f1f3;
  color: #6f6a58;
  font: inherit;
  font-size: calc(var(--unit) * 48);
  line-height: calc(var(--unit) * 72);
  --pin-rest-shadow:
    inset 0 0 0 calc(var(--unit) * 4) #fbfbfb, 0 calc(var(--unit) * 4) calc(var(--unit) * 8) rgb(0 0 0 / 0.3);
  --pin-lit-shadow: var(--pin-rest-shadow), 0 0 0 calc(var(--unit) * 3) rgb(30 49 63 / 0.5);
  box-shadow: var(--pin-rest-shadow);
}

/* A pin is lit as a disc is lit: a navy halo a unit and a half out from its rim on hover and focus, and its press a cream
   fill. Provisional, as no recording shows a pin under the pointer; the pin's own brackets and pointer keep their pseudo-elements */
.pin:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) {
  outline: none;
  box-shadow: var(--pin-lit-shadow);
}

@media (hover: hover) {
  .pin:enabled:hover {
    outline: none;
    box-shadow: var(--pin-lit-shadow);
  }
}

.pin:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  background: v-bind(GAME_CREAM);
}

/* The plus is two bars of 40 by 7 in the game's grey, centred on the pin */
.plus {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 40);
  background:
    linear-gradient(#9c9ea2, #9c9ea2) center / 100% calc(var(--unit) * 7) no-repeat,
    linear-gradient(#9c9ea2, #9c9ea2) center / calc(var(--unit) * 7) 100% no-repeat;
  transform: translate(-50%, -50%);
}

/* The time left on the expedition away from a place, a dark tag above its pin */
.away {
  position: absolute;
  top: calc(var(--unit) * -110);
  left: 0;
  padding: calc(var(--unit) * 4) calc(var(--unit) * 14);
  border-radius: calc(var(--unit) * 14);
  background: rgb(24 26 34 / 0.9);
  color: #fff;
  font-size: calc(var(--unit) * 20);
  transform: translateX(-50%);
  white-space: nowrap;
}

.pin::after {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 0;
  height: 0;
  border: solid transparent;
  border-width: calc(var(--unit) * 17) calc(var(--unit) * 10) 0;
  border-top-color: #c4c7cc;
  content: "";
  transform: translateX(-50%);
}

/* The picked pin's brackets: four corners of 26 by 4 units, on a box 125 by 119 round the pin */
.pin[aria-pressed="true"]::before {
  position: absolute;
  top: calc(var(--unit) * -12);
  left: calc(var(--unit) * -19);
  width: calc(var(--unit) * 125);
  height: calc(var(--unit) * 119);
  background:
    linear-gradient(#fff, #fff) left top / calc(var(--unit) * 26) calc(var(--unit) * 4) no-repeat,
    linear-gradient(#fff, #fff) left top / calc(var(--unit) * 4) calc(var(--unit) * 26) no-repeat,
    linear-gradient(#fff, #fff) right top / calc(var(--unit) * 26) calc(var(--unit) * 4) no-repeat,
    linear-gradient(#fff, #fff) right top / calc(var(--unit) * 4) calc(var(--unit) * 26) no-repeat,
    linear-gradient(#fff, #fff) left bottom / calc(var(--unit) * 26) calc(var(--unit) * 4) no-repeat,
    linear-gradient(#fff, #fff) left bottom / calc(var(--unit) * 4) calc(var(--unit) * 26) no-repeat,
    linear-gradient(#fff, #fff) right bottom / calc(var(--unit) * 26) calc(var(--unit) * 4) no-repeat,
    linear-gradient(#fff, #fff) right bottom / calc(var(--unit) * 4) calc(var(--unit) * 26) no-repeat;
  content: "";
}
</style>
