<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { useTween } from "@/lib/phaser/composables/useTween";
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import { BarOrigin } from "@/models/dungeons/UI/bar/BarOrigin";
import { BarType } from "@/models/dungeons/UI/bar/BarType";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { dayjs } from "@/services/dayjs";
import { useSettingsStore } from "@/store/dungeons/settings";
import type { Tweens } from "phaser";
import { Math } from "phaser";

interface BarProps {
  type: BarType;
  imagePosition: ImagePosition;
  width: number;
  scaleY: number;
  barPercentage: number;
}

const { type, imagePosition, width, scaleY, barPercentage } = defineProps<BarProps>();
const emit = defineEmits<{
  "start:display-width": [tween: Tweens.Tween];
  "update:display-width": [value: number];
  "complete:display-width": [];
}>();
const settingsStore = useSettingsStore();
const { isSkipAnimations } = storeToRefs(settingsStore);
const barTextureMap = computed<Record<BarOrigin, ImageKey>>(() =>
  type === BarType.Experience
    ? {
        [BarOrigin.Left]: ImageKey.ExperienceBarLeftCap,
        [BarOrigin.Middle]: ImageKey.ExperienceBarMiddle,
        [BarOrigin.Right]: ImageKey.ExperienceBarRightCap,
      }
    : {
        [BarOrigin.Left]: ImageKey.HealthBarLeftCap,
        [BarOrigin.Middle]: ImageKey.HealthBarMiddle,
        [BarOrigin.Right]: ImageKey.HealthBarRightCap,
      },
);
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
    onStart: (tween) => {
      emit("start:display-width", tween);
    },
    onUpdate: (_tween, _key, _target, displayWidth) => {
      syncDisplayWidths(displayWidth);
      emit("update:display-width", displayWidth);
    },
    onComplete: () => {
      emit("complete:display-width");
    },
  });
});
</script>

<template>
  <!-- We use a placeholder component to hold the tween for the entire health bar -->
  <Image :configuration="{ visible: false, texture: '', displayWidth: barDisplayWidth, tween }" />
  <DungeonsUIBarLeftCap
    v-model:display-width="leftCapDisplayWidth"
    :image-position="imagePosition"
    :texture="barTextureMap[BarOrigin.Left]"
    :scale-y="scaleY"
  />
  <DungeonsUIBarMiddle
    :image-position="{ ...imagePosition, x: middleX }"
    :display-width="middleDisplayWidth"
    :texture="barTextureMap[BarOrigin.Middle]"
    :scale-y="scaleY"
  />
  <DungeonsUIBarRightCap
    v-model:display-width="rightCapDisplayWidth"
    :image-position="{ ...imagePosition, x: rightCapX }"
    :texture="barTextureMap[BarOrigin.Right]"
    :scale-y="scaleY"
  />
</template>
