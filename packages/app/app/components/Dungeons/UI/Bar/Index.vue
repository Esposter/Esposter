<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { BarType } from "@/models/dungeons/UI/bar/BarType";
import type { Tweens } from "phaser";
import type { TweenBuilderConfiguration } from "vue-phaserjs";

import { dayjs } from "#shared/services/dayjs";
import { BarOrigin } from "@/models/dungeons/UI/bar/BarOrigin";
import { BarTextureMap } from "@/services/dungeons/UI/bar/BarTextureMap";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Math } from "phaser";
import { Image, useTween } from "vue-phaserjs";

interface BarProps {
  barPercentage: number;
  imagePosition: ImagePosition;
  isSkipAnimations?: boolean;
  scaleY: number;
  type: BarType;
  width: number;
}

const { barPercentage, imagePosition, isSkipAnimations = false, scaleY, type, width } = defineProps<BarProps>();
const emit = defineEmits<{
  "complete:display-width": [];
  "start:display-width": [tween: Tweens.Tween];
  "update:display-width": [value: number];
}>();
const settingsStore = useSettingsStore();
const { isSkipAnimations: isSettingsSkipAnimations } = storeToRefs(settingsStore);
const barWidth = computed(() => (width * barPercentage) / 100);
const barDisplayWidth = ref(barWidth.value);
const { leftCapDisplayWidth, middleDisplayWidth, rightCapDisplayWidth, syncDisplayWidths } = useVDisplayWidths(
  () => width,
  barWidth,
);
const updateDisplayWidth = (newDisplayWidth: number) => {
  syncDisplayWidths(newDisplayWidth);
  emit("update:display-width", newDisplayWidth);
};
const middleX = computed(() => imagePosition.x + (leftCapDisplayWidth.value ?? 0));
const rightCapX = computed(() => middleX.value + (middleDisplayWidth.value ?? 0));
const tween = ref<TweenBuilderConfiguration>();

watch(
  () => isSkipAnimations,
  (newIsSkipAnimations) => {
    if (!newIsSkipAnimations) return;

    barDisplayWidth.value = barWidth.value;
    updateDisplayWidth(barWidth.value);
    emit("complete:display-width");
  },
);

watch(barWidth, (newBarWidth) => {
  if (isSkipAnimations) return;

  if (isSettingsSkipAnimations.value) {
    barDisplayWidth.value = newBarWidth;
    updateDisplayWidth(newBarWidth);
    emit("complete:display-width");
    return;
  }

  useTween(tween, {
    displayWidth: newBarWidth,
    duration: dayjs.duration(1, "second").asMilliseconds(),
    ease: Math.Easing.Sine.Out,
    onComplete: () => {
      emit("complete:display-width");
    },
    onStart: (startedTween) => {
      emit("start:display-width", startedTween);
    },
    onUpdate: (_tween, _key, _target, displayWidth) => {
      updateDisplayWidth(displayWidth);
    },
  });
});
</script>

<template>
  <!-- We use a placeholder component to hold the tween for the entire bar -->
  <Image :configuration="{ visible: false, texture: '', displayWidth: barDisplayWidth, tween }" />
  <DungeonsUIBarLeftCap
    v-model:display-width="leftCapDisplayWidth"
    :image-position
    :texture="BarTextureMap[type][BarOrigin.Left]"
    :scale-y
  />
  <DungeonsUIBarMiddle
    :image-position="{ ...imagePosition, x: middleX }"
    :display-width="middleDisplayWidth"
    :texture="BarTextureMap[type][BarOrigin.Middle]"
    :scale-y
  />
  <DungeonsUIBarRightCap
    v-model:display-width="rightCapDisplayWidth"
    :image-position="{ ...imagePosition, x: rightCapX }"
    :texture="BarTextureMap[type][BarOrigin.Right]"
    :scale-y
  />
</template>
