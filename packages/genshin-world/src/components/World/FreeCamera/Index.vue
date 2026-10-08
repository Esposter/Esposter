<script setup lang="ts">
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { FreeCamera, InputState } from "genshin-engine";

import water from "#src/data/windrise/water.json";
import { FREE_CAMERA_STEP_SECONDS } from "#src/services/constants";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { useLoop, useTres } from "@tresjs/core";
import { createFixedStepLoop, createFreeCamera, createGroundQuery } from "genshin-engine";
import { PerspectiveCamera, Vector3 } from "three";
import { onUnmounted } from "vue";

interface Props {
  // The frame's input, which the world screen reads once a frame before the camera moves
  inputState: InputState;
  // Whether a screen over the world holds it, which stops the camera's look and its steps where they are
  isHeld?: true;
  // The world coordinate the scene's origin stands on, which the floating origin moves and the ground is read through
  origin: Vector3;
}

const { inputState, isHeld, origin } = defineProps<Props>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
const controller = new AbortController();
// The ground is the terrain's own height function, read at the world coordinate the scene's origin shifts the camera to
const ground = createGroundQuery((x, z) => getWorldHeight(x + origin.x, z + origin.z), water.level);
let freeCamera: FreeCamera | undefined;
const fixedStepLoop = createFixedStepLoop(FREE_CAMERA_STEP_SECONDS, () => {
  freeCamera?.step(inputState, FREE_CAMERA_STEP_SECONDS);
});
// Registered ahead of the floating origin's shift, so the camera is moved before anything reads where it stands
onBeforeRender(({ delta }) => {
  const activeCamera = camera.value;
  if (isHeld || !(activeCamera instanceof PerspectiveCamera)) return;
  freeCamera ??= createFreeCamera({ camera: activeCamera, ground });
  freeCamera.look(inputState);
  fixedStepLoop.advance(delta);
});
// A click on the canvas takes the pointer, which the look reads while it is locked
renderer.domElement.addEventListener("click", () => renderer.domElement.requestPointerLock(), {
  signal: controller.signal,
});

onUnmounted(() => {
  controller.abort();
});
const placedPosition = new Vector3();
// A jump stands the camera at its pose: its ground point read through the scene's origin, at the ground's height there
// Plus the pose's own offset, which the clearance then lifts it above, the view level and facing the pose's yaw
defineExpose({
  place: ({ heightOffset, point, yaw }: WorldJumpPose) => {
    const x = point.x - origin.x;
    const z = point.z - origin.z;
    freeCamera?.place(placedPosition.set(x, ground.getGround(x, z).height + heightOffset, z), yaw, 0);
  },
});
</script>

<template />
