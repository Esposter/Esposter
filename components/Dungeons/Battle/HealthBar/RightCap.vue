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
const x = defineModel<number | undefined>("x", { required: true });
const animatedX = defineModel<number | undefined>("animatedX", { required: true });
const tween = computed<TweenBuilderConfiguration | undefined>(() => {
  if (animatedX.value === undefined) return;
  else
    return {
      x: animatedX.value,
      duration: dayjs.duration(1, "second").asMilliseconds(),
      ease: Math.Easing.Sine.Out,
      onUpdate: (_, __, ___, current) => {
        x.value = current;
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
    @update:x="(value: typeof x) => (x = value)"
  />
</template>
