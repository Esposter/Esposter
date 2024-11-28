<script setup lang="ts">
import { useBallStore } from "@/store/dungeons/battle/ball";
import { Curves, Math } from "phaser";
import { PathFollower } from "vue-phaserjs";

interface BallProps {
  scale?: number;
}

const { scale = 0.1 } = defineProps<BallProps>();
const ballStore = useBallStore();
const { endPosition, startPosition } = ballStore;
const { isVisible, pathFollower, texture } = storeToRefs(ballStore);
const alpha = ref(1);
const startPoint = new Math.Vector2(startPosition.x, startPosition.y);
const controlPoint1 = new Math.Vector2(200, 100);
const controlPoint2 = new Math.Vector2(endPosition.x, endPosition.y);
const endPoint = new Math.Vector2(endPosition.x, endPosition.y);
const curve = new Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);
const path = new Curves.Path(startPosition.x, startPosition.y).add(curve);

onUnmounted(() => {
  isVisible.value = false;
});
</script>

<template>
  <PathFollower
    :configuration="{ visible: isVisible, path, texture, scale, alpha }"
    @complete="
      (_scene, newPathFollower) => {
        pathFollower = newPathFollower;
      }
    "
  />
</template>
