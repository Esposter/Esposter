import type { Monster } from "@/models/dungeons/monster/Monster";
import { calculateTotalExperienceToLevel } from "@/services/dungeons/monster/calculateTotalExperienceToLevel";

export const useExperience = (monster: MaybeRef<Monster>) => {
  const totalExperienceToNextLevel = computed(() => calculateTotalExperienceToLevel(unref(monster).stats.level + 1));
  const experienceToNextLevel = computed(() => totalExperienceToNextLevel.value - unref(monster).status.exp);
  const barPercentage = computed(() => (unref(monster).status.exp / totalExperienceToNextLevel.value) * 100);
  return { experienceToNextLevel, barPercentage };
};
