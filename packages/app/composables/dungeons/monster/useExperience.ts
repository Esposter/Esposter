import type { Monster } from "@/models/dungeons/monster/Monster";
import { calculateTotalExperienceToLevel } from "@/services/dungeons/monster/calculateTotalExperienceToLevel";

export const useExperience = (monster: Ref<Monster>) => {
  const totalExperienceToCurrentLevel = computed(() => calculateTotalExperienceToLevel(monster.value.stats.level));
  const totalExperienceToNextLevel = computed(() => calculateTotalExperienceToLevel(monster.value.stats.level + 1));
  const experienceToNextLevel = computed(() => totalExperienceToNextLevel.value - monster.value.status.exp);
  const barPercentage = computed(
    () => (monster.value.status.exp / (totalExperienceToNextLevel.value - totalExperienceToCurrentLevel.value)) * 100,
  );
  return { experienceToNextLevel, barPercentage };
};
