<script setup lang="ts">
import { BarType } from "@/models/dungeons/UI/bar/BarType";
import { useExperienceBarStore } from "@/store/dungeons/UI/experienceBar";
import type { Position } from "grid-engine";

interface ExperienceBarProps {
  position: Position;
  width?: number;
  scaleY?: number;
  barPercentage: number;
}

const { position, width = 372, scaleY = 0.4, barPercentage: baseBarPercentage } = defineProps<ExperienceBarProps>();
const emit = defineEmits<{ "level-up": [onComplete: () => void] }>();
const experienceBarStore = useExperienceBarStore();
const { isAnimating, isSkipAnimations } = storeToRefs(experienceBarStore);
const isAnimatingLevelUp = ref(false);
const barPercentage = computed(() => (isAnimatingLevelUp.value ? 0 : baseBarPercentage));
</script>

<template>
  <DungeonsUIBarContainer
    :type="BarType.Experience"
    :position
    :width
    :scale-y="scaleY"
    :bar-percentage="barPercentage"
    :is-skip-animations="isSkipAnimations"
    @start:display-width="isAnimating = true"
    @update:display-width="
      (value) => {
        if (isAnimatingLevelUp || value < width) return;

        isAnimatingLevelUp = true;
        isAnimating = false;
        emit('level-up', () => {
          isAnimatingLevelUp = false;
        });
      }
    "
    @complete:display-width="isAnimating = false"
  />
</template>
