<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI//Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import { useTween } from "@/lib/phaser/composables/useTween";
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { dayjs } from "@/services/dayjs";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Math } from "phaser";

interface Props {
  imagePosition: ImagePosition;
  width: number;
  scaleY: number;
  barPercentage: number;
}

const { imagePosition, width, scaleY, barPercentage } = defineProps<Props>();
const settingsStore = useSettingsStore();
const { isSkipAnimations } = storeToRefs(settingsStore);
const barWidth = computed(() => (width * barPercentage) / 100);
const barDisplayWidth = ref(barWidth.value);
const { leftCapDisplayWidth, middleDisplayWidth, rightCapDisplayWidth, syncDisplayWidths } = useDisplayWidths(
  () => width,
  barWidth,
);
const middleX = computed(() => imagePosition.x + (leftCapDisplayWidth.value ?? 0));
const rightCapX = computed(() => middleX.value + (middleDisplayWidth.value ?? 0));
const tween = ref<TweenBuilderConfiguration>();

watch(barWidth, (newBarWidth) => {
  if (isSkipAnimations.value) {
    barDisplayWidth.value = newBarWidth;
    syncDisplayWidths(newBarWidth);
    return;
  }

  useTween(tween, {
    duration: dayjs.duration(1, "second").asMilliseconds(),
    displayWidth: newBarWidth,
    ease: Math.Easing.Sine.Out,
    onUpdate: (_, __, ___, current) => {
      syncDisplayWidths(current);
    },
  });
});
</script>

<template>
  <!-- We use a placeholder component to hold the tween for the entire health bar -->
  <Image :configuration="{ visible: false, texture: '', displayWidth: barDisplayWidth, tween }" />
  <DungeonsUILeftCap
    v-model:display-width="leftCapDisplayWidth"
    :image-position="imagePosition"
    :scale-y="scaleY"
  />
  <DungeonsUIMiddle
    :image-position="{ ...imagePosition, x: middleX }"
    :display-width="middleDisplayWidth"
    :scale-y="scaleY"
  />
  <DungeonsUIRightCap
    v-model:x="rightCapX"
    v-model:display-width="rightCapDisplayWidth"
    :y="imagePosition.y"
    :image-origin="{ originX: imagePosition.originX, originY: imagePosition.originY }"
    :scale-y="scaleY"
  />
</template>
