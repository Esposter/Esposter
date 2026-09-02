import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { calculateLevelExperience } from "@/services/dungeons/monster/calculateLevelExperience";

export const useExperience = (monster: Ref<Monster>) => {
  const levelExperience = computed(() => calculateLevelExperience(monster.value.statistics.level));
  const experienceToNextLevel = computed(() => levelExperience.value - monster.value.status.experience);
  const barPercentage = computed(() => (monster.value.status.experience / levelExperience.value) * 100);
  return { barPercentage, experienceToNextLevel };
};
