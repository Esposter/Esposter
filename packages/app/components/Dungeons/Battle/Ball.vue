<script setup lang="ts">
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import type { BallKey } from "@/models/dungeons/keys/image/UI/BallKey";
import type { Position } from "grid-engine";
import type { GameObjects } from "phaser";

import PathFollower from "@/lib/phaser/components/PathFollower.vue";
import { useTween } from "@/lib/phaser/composables/useTween";
import { dayjs } from "@/services/dayjs";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Curves, Math } from "phaser";

interface BallProps {
  scale?: number;
  texture: BallKey;
}

const { scale, texture } = defineProps<BallProps>();
const settingsStore = useSettingsStore();
const { isSkipAnimations } = storeToRefs(settingsStore);
const startPosition = Object.freeze<Position>({ x: 0, y: 500 });
const endPosition = Object.freeze<Position>({ x: 725, y: 180 });
const position = ref({ ...startPosition });
const isVisible = ref(false);
const alpha = ref(1);
const startPoint = new Math.Vector2(startPosition.x, startPosition.y);
const controlPoint1 = new Math.Vector2(200, 100);
const controlPoint2 = new Math.Vector2(endPosition.x, endPosition.y);
const endPoint = new Math.Vector2(endPosition.x, endPosition.y);
const curve = new Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);
const path = new Curves.Path(startPosition.x, startPosition.y).add(curve);
const tween = ref<TweenBuilderConfiguration>();

const playThrowBallAnimation = (pathFollower: GameObjects.PathFollower) => {
  if (isSkipAnimations.value) {
    position.value = { ...endPosition };
    isVisible.value = true;
    return;
  }

  return new Promise<void>((resolve) => {
    position.value = { ...startPosition };
    isVisible.value = true;
    pathFollower.startFollow({
      duration: dayjs.duration(1, "second").asMilliseconds(),
      ease: Math.Easing.Sine.InOut,
      onComplete: () => {
        resolve();
      },
    });
  });
};

const playShakeBallAnimation = () => {
  if (isSkipAnimations.value) return;

  return new Promise<void>((resolve) => {
    useTween(tween, {
      delay: dayjs.duration(0.2, "seconds").asMilliseconds(),
      duration: dayjs.duration(0.15, "seconds").asMilliseconds(),
      ease: Math.Easing.Sine.InOut,
      onComplete: () => {
        resolve();
      },
      repeat: 2,
      repeatDelay: dayjs.duration(0.8, "seconds").asMilliseconds(),
      x: position.value.x + 10,
      yoyo: true,
    });
  });
};
</script>

<template>
  <PathFollower
    :configuration="{ visible: isVisible, path, ...position, texture, scale, alpha, tween }"
    @complete="
      async (_scene, pathFollower) => {
        await playThrowBallAnimation(pathFollower);
        await playShakeBallAnimation();
      }
    "
  />
</template>
