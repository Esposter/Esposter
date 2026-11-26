<script setup lang="ts">
import { useBallStore } from "#src/store/dungeons/battle/ball";
import { Curves, Math } from "phaser";
import { PathFollower } from "vue-phaserjs";

interface Props {
  scale?: number | undefined;
}

const { scale = 0.1 } = defineProps<Props>();
const ballStore = useBallStore();
const { endPosition, startPosition } = ballStore;
const { isVisible, pathFollower, texture } = storeToRefs(ballStore);
const startPoint = new Math.Vector2(startPosition.x, startPosition.y);
const controlPoint1 = new Math.Vector2(200, 100);
const controlPoint2 = new Math.Vector2(endPosition.x, endPosition.y);
const endPoint = new Math.Vector2(endPosition.x, endPosition.y);
const curve = new Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);
const path = new Curves.Path(startPosition.x, startPosition.y).add(curve);

onUnmounted(() => {
  isVisible.value = false;
  pathFollower.value = undefined;
});
</script>

<template>
  <PathFollower
    :configuration="{ visible: isVisible, path, texture, scale, alpha: 1 }"
    @complete="(_scene, newPathFollower) => {
      pathFollower = markRaw(newPathFollower);
    }"
  />
</template>
