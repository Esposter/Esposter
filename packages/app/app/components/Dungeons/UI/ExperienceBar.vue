<script setup lang="ts">
import type { Position } from "grid-engine";

import { BarType } from "@/models/dungeons/UI/bar/BarType";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useExperienceBarStore } from "@/store/dungeons/UI/experienceBar";

interface ExperienceBarProps {
  barPercentage: number;
  position: Position;
  scaleY?: number;
  width?: number;
}

const { barPercentage: baseBarPercentage, position, scaleY = 0.4, width = 372 } = defineProps<ExperienceBarProps>();
const emit = defineEmits<{ "level-up": [onComplete: () => void] }>();
const settingsStore = useSettingsStore();
const { isSkipAnimations: isSettingsSkipAnimations } = storeToRefs(settingsStore);
const experienceBarStore = useExperienceBarStore();
const { isAnimating, isSkipAnimations } = storeToRefs(experienceBarStore);
const isAnimatingLevelUp = ref(false);
const barPercentage = computed(() =>
  isAnimatingLevelUp.value && !(isSkipAnimations.value || isSettingsSkipAnimations.value) ? 0 : baseBarPercentage,
);
</script>

<template>
  <!-- When we are animating the Experience Bar and we want to skip the animation via player input,
   :is-skip-animations="isSkipAnimations && !isAnimatingLevelUp" so the prop changes after we finish 
   leveling up and reset isAnimatingLevelUp. The experience bar display width can then be properly updated.
   There are also 2 situations we need to consider when skipping the animation via player input
   1. If we are leveling up, we want to reset isSkipAnimations trigger after level up animation has finished
   2. If we are NOT leveling up, we want to reset isSkipAnimations trigger after the tween animation has finished -->
  <DungeonsUIBarContainer
    :type="BarType.Experience"
    :position
    :width
    :scale-y
    :bar-percentage
    :is-skip-animations="isSkipAnimations && !isAnimatingLevelUp"
    @start:display-width="isAnimating = true"
    @update:display-width="
      (value) => {
        if (isAnimatingLevelUp || value < width) return;

        isAnimatingLevelUp = true;
        emit('level-up', () => {
          isAnimatingLevelUp = isSkipAnimations = false;
        });
      }
    "
    @complete:display-width="
      () => {
        isAnimating = false;
        if (isAnimatingLevelUp) return;
        isSkipAnimations = false;
      }
    "
  />
</template>
