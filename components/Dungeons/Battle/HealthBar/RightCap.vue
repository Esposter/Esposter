<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { dayjs } from "@/services/dayjs";
import { Math } from "phaser";

interface RightCapProps {
  y: number;
  scaleY: number;
}

const { y, scaleY } = defineProps<RightCapProps>();
const x = defineModel<number | undefined>("x");
const animatedX = defineModel<number | undefined>("animatedX");
const tween = computed<TweenBuilderConfiguration | undefined>(() => {
  if (animatedX.value === undefined) return;
  return {
    x: animatedX.value,
    duration: dayjs.duration(1, "second").asMilliseconds(),
    ease: Math.Easing.Sine.Out,
    onUpdate: (_, __, ___, current) => {
      x.value = current;
    },
    onComplete: () => {
      animatedX.value = undefined;
    },
  };
});
</script>

<template>
  <Image
    :configuration="{
      x,
      y,
      textureKey: TextureManagerKey.HealthBarRightCap,
      originX: 0,
      originY: 0.5,
      scaleY,
      tween,
    }"
    @update:x="(value: number | undefined) => (x = value)"
  />
</template>
