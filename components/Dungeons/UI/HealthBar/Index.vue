<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/HealthBar/Container.vue";
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { getHealthBarXTween } from "@/services/dungeons/battle/getHealthBarXTween";
import { useSettingsStore } from "@/store/dungeons/settings";

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
const leftCapDisplayWidth = ref<number>();
const middleDisplayWidth = computed(() => rightCapX.value - middleX.value);
const middleX = computed(() => imagePosition.x + (leftCapDisplayWidth.value ?? 0));
const rightCapX = ref(imagePosition.x + (leftCapDisplayWidth.value ?? 0) + barWidth.value);
const rightCapXTween = ref<TweenBuilderConfiguration>();
const isVisible = computed(() => middleDisplayWidth.value > 0);
// We kinda need to do this very weird thing of animating our right cap x imagePosition
// and computing the middle display width value based on that instead of the other way around
// even though that way is much easier because it is visually smoother to have phaser perform
// the x imagePosition calculation + rendering first and moving the right cap before we shrink the
// middle bar. It is a little disgusting that we need to wait before we get the display width
// of the left cap to determine the imagePosition of the right cap though and we wouldn't have
// needed to do this if we could compute it based on the middleX + bar width values :C
watch(leftCapDisplayWidth, (newLeftCapDisplayWidth) => {
  if (newLeftCapDisplayWidth === undefined) return;
  rightCapX.value = imagePosition.x + newLeftCapDisplayWidth + barWidth.value;
});

watch(barWidth, (newBarWidth) => {
  const newRightCapX = middleX.value + newBarWidth;
  if (isSkipAnimations.value) rightCapX.value = newRightCapX;
  else rightCapXTween.value = getHealthBarXTween(rightCapX, newRightCapX);
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
      :scale-y="scaleY"
      :display-width="middleDisplayWidth"
    />
    <DungeonsUIHealthBarRightCap
      v-model:x="rightCapX"
      :y="imagePosition.y"
      :image-origin="{ originX: imagePosition.originX, originY: imagePosition.originY }"
      :scale-y="scaleY"
      :tween="rightCapXTween"
    />
  </template>
</template>
