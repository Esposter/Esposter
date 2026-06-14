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
  <!-- To skip the animation via player input, is-skip-animations only flips after level-up finishes
   (gated on !isAnimatingLevelUp) so the display width updates correctly. Two cases for resetting the
   isSkipAnimations trigger:
   1. Leveling up: reset after the level-up animation finishes.
   2. Not leveling up: reset after the tween animation finishes. -->
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
