export const calculateExperienceGain = (baseExperience: number, enemyLevel: number) =>
  Math.round((baseExperience * enemyLevel) / 7);
