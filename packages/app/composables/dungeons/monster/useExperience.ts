import type { Monster } from "@/models/dungeons/monster/Monster";

import { calculateLevelExperience } from "@/services/dungeons/monster/calculateLevelExperience";

export const useExperience = (monster: Ref<Monster>) => {
  const levelExperience = computed(() => calculateLevelExperience(monster.value.stats.level));
  const experienceToNextLevel = computed(() => levelExperience.value - monster.value.status.exp);
  const barPercentage = computed(() => (monster.value.status.exp / levelExperience.value) * 100);
  return { barPercentage, experienceToNextLevel };
};
