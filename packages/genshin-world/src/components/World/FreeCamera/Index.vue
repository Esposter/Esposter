<script setup lang="ts">
import type { FreeCamera, InputState } from "genshin-engine";
import type { Vector3 } from "three";

import { CAMERA_FRAME_PRIORITY, FIXED_STEP_SECONDS } from "#src/services/constants";
import { useLoop, useTres } from "@tresjs/core";
import { createFixedStepLoop, createFreeCamera, createGroundQuery } from "genshin-engine";
import { PerspectiveCamera } from "three";
import { onUnmounted } from "vue";

interface Props {
  // The world's ground at a point in its own coordinates, which the camera flies above
  getGroundHeight: (x: number, z: number) => number;
  // The frame's input, which the world screen reads once a frame before the camera moves
  inputState: InputState;
  // Whether a screen over the world holds it, which stops the camera's look and its steps where they are
  isHeld?: true;
  // The world coordinate the scene's origin stands on, which the floating origin moves and the ground is read through
  origin: Vector3;
  // The water's level, which the camera keeps above
  waterLevel: number;
}

const { getGroundHeight, inputState, isHeld, origin, waterLevel } = defineProps<Props>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
const controller = new AbortController();
// The ground is the terrain's own height function, read at the world coordinate the scene's origin shifts the camera to
const ground = createGroundQuery((x, z) => getGroundHeight(x + origin.x, z + origin.z), waterLevel);
let freeCamera: FreeCamera | undefined;
const fixedStepLoop = createFixedStepLoop(FIXED_STEP_SECONDS, () => {
  freeCamera?.step(inputState, FIXED_STEP_SECONDS);
});
// Ahead of the floating origin's shift, so the camera is moved before anything reads where it stands. Made on its first
// Frame, it flies from wherever the camera stands then
onBeforeRender(({ delta }) => {
  const activeCamera = camera.value;
  if (isHeld || !(activeCamera instanceof PerspectiveCamera)) return;
  freeCamera ??= createFreeCamera({ camera: activeCamera, ground });
  freeCamera.look(inputState);
  fixedStepLoop.advance(delta);
}, CAMERA_FRAME_PRIORITY);
// A click on the canvas takes the pointer, which the look reads while it is locked
renderer.domElement.addEventListener("click", () => renderer.domElement.requestPointerLock(), {
  signal: controller.signal,
});

onUnmounted(() => {
  controller.abort();
});
</script>

<template />
