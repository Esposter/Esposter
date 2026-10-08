<script setup lang="ts">
import type { FreeCamera, InputState } from "genshin-engine";
import type { Vector3 } from "three";

import water from "#src/data/windrise/water.json";
import { FREE_CAMERA_STEP_SECONDS } from "#src/services/constants";
import { getWindriseHeight } from "#src/services/windrise/getWindriseHeight";
import { useLoop, useTres } from "@tresjs/core";
import { createFixedStepLoop, createFreeCamera, createGroundQuery, createInput } from "genshin-engine";
import { PerspectiveCamera } from "three";

interface Props {
  // The world coordinate the scene's origin stands on, which the floating origin moves and the ground is read through
  origin: Vector3;
}

const { origin } = defineProps<Props>();
const { camera } = useTres();
const { onBeforeRender } = useLoop();
const input = createInput(window);
// The ground is the terrain's own height function, read at the world coordinate the scene's origin shifts the camera to
const ground = createGroundQuery((x, z) => getWindriseHeight(x + origin.x, z + origin.z), water.level);
let frameInput: InputState = input.readInput();
let freeCamera: FreeCamera | undefined;
const fixedStepLoop = createFixedStepLoop(FREE_CAMERA_STEP_SECONDS, () => {
  freeCamera?.step(frameInput, FREE_CAMERA_STEP_SECONDS);
  // The look is a turn the pointer made rather than a rate, so the first step spends it and the rest turn nothing
  frameInput.lookYaw = 0;
  frameInput.lookPitch = 0;
});
// Registered ahead of the floating origin's shift, so the camera is moved before anything reads where it stands
onBeforeRender(({ delta }) => {
  const activeCamera = camera.value;
  if (!(activeCamera instanceof PerspectiveCamera)) return;
  freeCamera ??= createFreeCamera({ camera: activeCamera, ground });
  // A frame that ran no step leaves its turn unspent, carried into the next frame's rather than dropped
  const { lookPitch, lookYaw } = frameInput;
  frameInput = input.readInput();
  frameInput.lookYaw += lookYaw;
  frameInput.lookPitch += lookPitch;
  fixedStepLoop.advance(delta);
});

onUnmounted(() => {
  input.dispose();
});
</script>

<template />
