<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { BarType } from "@/models/dungeons/UI/bar/BarType";
import type { Tweens } from "phaser";
import type { TweenBuilderConfiguration } from "vue-phaserjs";

import { BarTextureMap } from "@/services/dungeons/UI/bar/BarTextureMap";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Math } from "phaser";
import { Image, useTween } from "vue-phaserjs";

interface Props {
  barPercentage: number;
  imagePosition: ImagePosition;
  isSkipAnimations?: boolean;
  scaleY: number;
  type: BarType;
  width: number;
}

const { barPercentage, imagePosition, isSkipAnimations = false, scaleY, type, width } = defineProps<Props>();
const emit = defineEmits<{
  "complete:display-width": [];
  "start:display-width": [tween: Tweens.Tween];
  "update:display-width": [value: number];
}>();
const settingsStore = useSettingsStore();
const { isSkipAnimations: isSettingsSkipAnimations } = storeToRefs(settingsStore);
const barWidth = computed(() => (width * barPercentage) / 100);
const barDisplayWidth = ref(barWidth.value);
const { leftCapDisplayWidth, middleDisplayWidth, rightCapDisplayWidth, syncDisplayWidths } = useDisplayWidths(
  () => width,
  barWidth,
);
const updateDisplayWidth = (newDisplayWidth: number) => {
  syncDisplayWidths(newDisplayWidth);
  emit("update:display-width", newDisplayWidth);
};
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
    duration: Temporal.Duration.from({ seconds: 1 }).total("milliseconds"),
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
  <!-- Invisible: it exists only to own the tween that drives the whole bar -->
  <Image :configuration="{ visible: false, texture: '', displayWidth: barDisplayWidth, tween }" />
  <DungeonsUIBarSegments
    v-model:left-cap-display-width="leftCapDisplayWidth"
    v-model:right-cap-display-width="rightCapDisplayWidth"
    :image-position
    :middle-display-width
    :scale-y
    :textures="BarTextureMap[type]"
    is-hidden-when-empty
  />
</template>
