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
const leftCapDisplayWidth = ref<number>();
const barWidth = computed(() => (width * barPercentage) / 100);
const middleX = computed(() => imagePosition.x + (leftCapDisplayWidth.value ?? 0));
// Unfortunately, we need to do this little hack here of extending
// our middle bar width to account for the animation delay caused by
// vue's computed trigger being a little slow calling phaser's displayWidth setter
const offset = 3;
const middleDisplayWidth = ref(barWidth.value + offset);
// This is the actual display width to use for calculating positions of other images
const properMiddleDisplayWidth = ref(barWidth.value);
const rightCapX = computed(() => middleX.value + properMiddleDisplayWidth.value);
const isVisible = computed(() => properMiddleDisplayWidth.value > 0);
const tween = ref<TweenBuilderConfiguration>();

watch(barWidth, (newBarWidth) => {
  if (isSkipAnimations.value) return;

  tween.value = {
    duration: dayjs.duration(1, "second").asMilliseconds(),
    displayWidth: newBarWidth + offset,
    ease: Math.Easing.Sine.Out,
    onUpdate: (_, __, ___, current) => {
      properMiddleDisplayWidth.value = current - offset;
    },
    onComplete: () => {
      tween.value = undefined;
    },
  };
});
</script>

<template>
  <template v-if="isVisible">
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
      :y="imagePosition.y"
      :image-origin="{ originX: imagePosition.originX, originY: imagePosition.originY }"
      :scale-y="scaleY"
    />
  </template>
</template>
