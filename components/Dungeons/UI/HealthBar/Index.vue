<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/HealthBar/Container.vue";
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { dayjs } from "@/services/dayjs";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Math } from "phaser";

interface HealthBarProps {
  imagePosition: ImagePosition;
  width: number;
  scaleY: number;
  barPercentage: number;
}

const { imagePosition, width, scaleY, barPercentage } = defineProps<HealthBarProps>();
const settingsStore = useSettingsStore();
const { isSkipAnimations } = storeToRefs(settingsStore);
const barWidth = computed(() => (width * barPercentage) / 100);
const { leftCapDisplayWidth, middleDisplayWidth, rightCapDisplayWidth, syncDisplayWidths } = useDisplayWidths(
  () => width,
  barWidth,
);
const middleX = computed(() => imagePosition.x + (leftCapDisplayWidth.value ?? 0));
const rightCapX = computed(() => middleX.value + (middleDisplayWidth.value ?? 0));
const tween = ref<TweenBuilderConfiguration>();

watch(barWidth, (newBarWidth) => {
  if (isSkipAnimations.value) {
    syncDisplayWidths(newBarWidth);
    return;
  }

  tween.value = {
    duration: dayjs.duration(1, "second").asMilliseconds(),
    displayWidth: newBarWidth,
    ease: Math.Easing.Sine.Out,
    onUpdate: (_, __, ___, current) => {
      syncDisplayWidths(current);
    },
    onComplete: () => {
      tween.value = undefined;
    },
  };
});
</script>

<template>
  <DungeonsUIHealthBarLeftCap
    v-model:display-width="leftCapDisplayWidth"
    :image-position="imagePosition"
    :scale-y="scaleY"
  />
  <DungeonsUIHealthBarMiddle
    :image-position="{ ...imagePosition, x: middleX }"
    :display-width="middleDisplayWidth"
    :scale-y="scaleY"
    :tween
  />
  <DungeonsUIHealthBarRightCap
    v-model:x="rightCapX"
    v-model:display-width="rightCapDisplayWidth"
    :y="imagePosition.y"
    :image-origin="{ originX: imagePosition.originX, originY: imagePosition.originY }"
    :scale-y="scaleY"
  />
</template>
