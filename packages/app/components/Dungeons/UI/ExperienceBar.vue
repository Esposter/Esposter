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
const emit = defineEmits<{ "level-up": [onComplete: () => void, isSkipAnimations?: true] }>();
const experienceBarStore = useExperienceBarStore();
const { isRunningLevelUpAnimation } = storeToRefs(experienceBarStore);
const isLevelUp = ref(false);
const barPercentage = computed(() => (isLevelUp.value ? 0 : baseBarPercentage));
</script>

<template>
  <DungeonsUIBarContainer
    :type="BarType.Experience"
    :position
    :width
    :scale-y="scaleY"
    :bar-percentage="barPercentage"
    @active:display-width="isRunningLevelUpAnimation = true"
    @update:display-width="
      (value) => {
        if (value >= width) {
          isRunningLevelUpAnimation = false;
          isLevelUp = true;
          emit('level-up', () => {
            isLevelUp = false;
          });
        }
      }
    "
  />
</template>
