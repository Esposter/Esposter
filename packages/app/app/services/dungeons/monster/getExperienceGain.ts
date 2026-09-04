export const getExperienceGain = (baseExperience: number, enemyLevel: number) =>
  Math.round((baseExperience * enemyLevel) / 7);
