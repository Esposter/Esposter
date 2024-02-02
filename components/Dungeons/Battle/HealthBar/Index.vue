<script setup lang="ts">
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { getHealthBarXTween } from "@/services/dungeons/battle/getHealthBarXTween";
import { type Position } from "grid-engine";

interface HealthBarProps {
  position: Position;
  barPercentage: number;
}

const { position, barPercentage } = defineProps<HealthBarProps>();
const fullBarWidth = 360;
const scaleY = 0.7;
const barWidth = computed(() => (fullBarWidth * barPercentage) / 100);
const leftCapDisplayWidth = ref<number>();
const middleDisplayWidth = computed(() => rightCapX.value - middleX.value);
const middleX = computed(() => position.x + (leftCapDisplayWidth.value ?? 0));
const rightCapX = ref(position.x + (leftCapDisplayWidth.value ?? 0) + barWidth.value);
const rightCapXTween = ref<TweenBuilderConfiguration>();
const isVisible = computed(() => middleDisplayWidth.value > 0);
// We kinda need to do this very weird thing of animating our right cap x position
// and computing the middle display width value based on that instead of the other way around
// even though that way is much easier because it is visually smoother to have phaser perform
// the x position calculation + rendering first and moving the right cap before we shrink the
// middle bar. It is a little disgusting that we need to wait before we get the display width
// of the left cap to determine the position of the right cap though and we wouldn't have
// needed to do this if we could compute it based on the middleX + bar width values :C
watch(leftCapDisplayWidth, (newLeftCapDisplayWidth) => {
  if (newLeftCapDisplayWidth === undefined) return;
  rightCapX.value = position.x + newLeftCapDisplayWidth + barWidth.value;
});
// We'll just assume that all changes to the bar width right now will be animated
// until a use case pops up where we want to just change it immediately without the animation
watch(barWidth, (newBarWidth) => {
  rightCapXTween.value = getHealthBarXTween(rightCapX, middleX.value + newBarWidth);
});
</script>

<template>
  <template v-if="isVisible">
    <DungeonsBattleHealthBarLeftCap
      v-model:display-width="leftCapDisplayWidth"
      :position="position"
      :scale-y="scaleY"
    />
    <DungeonsBattleHealthBarMiddle
      :position="{ ...position, x: middleX }"
      :scale-y="scaleY"
      :display-width="middleDisplayWidth"
    />
    <DungeonsBattleHealthBarRightCap v-model:x="rightCapX" :y="position.y" :scale-y="scaleY" :tween="rightCapXTween" />
  </template>
</template>
