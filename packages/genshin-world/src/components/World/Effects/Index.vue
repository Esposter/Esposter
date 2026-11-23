<script setup lang="ts">
import type { WorldEffect } from "#src/models/effects/WorldEffect";
import type { WorldEffectDrawing } from "#src/models/effects/WorldEffectDrawing";
import type { Camera } from "three";

import { EFFECT_HEIGHT } from "#src/services/effects/constants";
import { useRafFn } from "@vueuse/core";
import { GAME_FONT_FAMILY } from "genshin-interface/constants";
import { Vector3 } from "three";

interface Props {
  // The world's visuals, which the kit steps and drops as their lives run out, each drawn where it shows
  effects: WorldEffect[];
  // The camera the world is drawn through, none until the canvas has one
  getCamera: () => Camera | undefined;
  // The world's ground at a point in its own coordinates, which each effect is lifted from
  getGroundHeight: (x: number, z: number) => number;
  // The world coordinate the scene's origin stands on, taken off each effect's point before it is projected through the
  // Camera
  origin: Vector3;
}

const { effects, getCamera, getGroundHeight, origin } = defineProps<Props>();
const drawings = shallowRef<WorldEffectDrawing[]>([]);
const point = new Vector3();
// Each effect in view is projected through the camera where it stands, lifted to the middle of a body. The drawings are
// Handed on only when there are some or there were, so an empty world re-renders nothing
useRafFn(() => {
  const camera = getCamera();
  if (!camera || effects.length === 0) {
    if (drawings.value.length > 0) drawings.value = [];
    return;
  }
  drawings.value = effects.flatMap(({ damage, kind, position, seconds, secondsRemaining, target }) => {
    // An effect with a target is drawn where its life has carried it from its point towards that target
    const progress = 1 - secondsRemaining / seconds;
    const to = target ?? position;
    const x = position.x + (to.x - position.x) * progress;
    const z = position.z + (to.z - position.z) * progress;
    point.set(x - origin.x, getGroundHeight(x, z) + EFFECT_HEIGHT, z - origin.z).project(camera);
    if (Math.abs(point.z) > 1) return [];
    return [
      {
        kind,
        left: ((point.x + 1) / 2) * 100,
        progress,
        text: damage === undefined ? "" : String(Math.round(damage)),
        top: ((1 - point.y) / 2) * 100,
      },
    ];
  });
});
</script>

<template>
  <div class="world-effects">
    <!-- An effect has no identity past its place in the list, and its look is read from its progress alone, so a
    drawing is keyed by its place -->
    <div
      v-for="({ kind, left, progress, text, top }, index) in drawings"
      :key="index"
      :class="kind"
      :style="{ left: `${left}%`, top: `${top}%`, '--progress': progress }"
    >
      {{ text }}
    </div>
  </div>
</template>

<style scoped>
/* The effects float over the world, so they never take a press the world would have had */
.world-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Each kind sets its own transform: a rule here would outrank theirs on specificity and cancel their growth and rise */
.world-effects > div {
  position: absolute;
}

/* Provisional: the spark and the flash are one disc that grows and fades, each with its own size and glow, until task 1.1
measures them off the held world attacks capture */
.spark,
.flash {
  border-radius: 50%;
  opacity: calc(1 - var(--progress));
  transform: translate(-50%, -50%) scale(calc(0.5 + var(--progress)));
}

.spark {
  width: 1.5rem;
  height: 1.5rem;
  background: radial-gradient(circle, #fff 0%, transparent 70%);
}

.flash {
  width: 4rem;
  height: 4rem;
  background: radial-gradient(circle, rgb(255 255 255 / 0.8) 0%, transparent 70%);
}

/* Provisional: the energy drop's size, until a recording of it is measured. It does not fade: it leaves the screen
as it arrives */
.energyDrop {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, transparent 70%);
  transform: translate(-50%, -50%);
}

/* Provisional: the number's size, its rise and its fade, until task 1.1 measures them off the held world attacks capture.
The number is set in the interface's own type */
.damage {
  color: #fff;
  font-family: v-bind(GAME_FONT_FAMILY);
  font-size: 1.25rem;
  text-shadow: 0 0 0.25rem #000;
  white-space: nowrap;
  opacity: calc(1 - var(--progress));
  transform: translate(-50%, calc(-50% - var(--progress) * 3rem));
}
</style>
