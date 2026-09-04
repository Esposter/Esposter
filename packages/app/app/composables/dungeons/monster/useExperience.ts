import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { getLevelExperience } from "@/services/dungeons/monster/getLevelExperience";

export const useExperience = (monster: Ref<Monster>) => {
  const levelExperience = computed(() => getLevelExperience(monster.value.statistics.level));
  const experienceToNextLevel = computed(() => levelExperience.value - monster.value.status.experience);
  const barPercentage = computed(() => (monster.value.status.experience / levelExperience.value) * 100);
  return { barPercentage, experienceToNextLevel };
};
