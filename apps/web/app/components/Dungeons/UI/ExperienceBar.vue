<script setup lang="ts">
import type { Position } from "grid-engine-headless";

import { BarType } from "#src/models/dungeons/UI/bar/BarType";
import { BAR_WIDTH } from "#src/services/dungeons/UI/bar/constants";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { useExperienceBarStore } from "#src/store/dungeons/UI/experienceBar";

interface Props {
  barPercentage: number;
  position: Position;
}

const { barPercentage: baseBarPercentage } = defineProps<Props>();
const emit = defineEmits<{ "level-up": [onComplete: () => void] }>();
const settingsStore = useSettingsStore();
const { isSkipAnimations: isSettingsSkipAnimations } = storeToRefs(settingsStore);
const experienceBarStore = useExperienceBarStore();
const { isAnimating, isSkipAnimations } = storeToRefs(experienceBarStore);
const isAnimatingLevelUp = ref(false);
</script>

<template>
  <!-- To skip the animation via player input, is-skip-animations only flips after level-up finishes
   (gated on !isAnimatingLevelUp) so the display width updates correctly. Two cases for resetting the
   isSkipAnimations trigger:
   1. Leveling up: reset after the level-up animation finishes.
   2. Not leveling up: reset after the tween animation finishes. -->
  <DungeonsUIBarContainer
    :type="BarType.Experience"
    :position
    :width="BAR_WIDTH"
    :scale-y="0.4"
    :bar-percentage="isAnimatingLevelUp && !(isSkipAnimations || isSettingsSkipAnimations) ? 0 : baseBarPercentage"
    :is-skip-animations="(isSkipAnimations && !isAnimatingLevelUp) || undefined"
    @start:display-width="isAnimating = true"
    @update:display-width="(value) => {
      if (isAnimatingLevelUp || value < BAR_WIDTH) return;
    
      isAnimatingLevelUp = true;
      emit('level-up', () => {
        isAnimatingLevelUp = isSkipAnimations = false;
      });
    }"
    @complete:display-width="() => {
      isAnimating = false;
      if (isAnimatingLevelUp) return;
      isSkipAnimations = false;
    }"
  />
</template>
