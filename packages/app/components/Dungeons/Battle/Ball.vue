<script setup lang="ts">
import type { BallKey } from "@/models/dungeons/keys/image/UI/BallKey";

import PathFollower from "@/lib/phaser/components/PathFollower.vue";
import { dayjs } from "@/services/dayjs";
import { Curves, Math } from "phaser";

interface BallProps {
  scale?: number;
  texture: BallKey;
}

const { scale, texture } = defineProps<BallProps>();
const startPoint = new Math.Vector2(0, 500);
const controlPoint1 = new Math.Vector2(200, 100);
const controlPoint2 = new Math.Vector2(725, 180);
const endPoint = new Math.Vector2(725, 180);
const curve = new Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);
const path = new Curves.Path(0, 500).add(curve);
</script>

<template>
  <PathFollower
    :configuration="{ path, x: 725, y: 180, texture, scale }"
    @complete="
      (_scene, pathFollower) =>
        pathFollower.startFollow({
          duration: dayjs.duration(1, 'second').asMilliseconds(),
          ease: Math.Easing.Sine.InOut,
        })
    "
  />
</template>
