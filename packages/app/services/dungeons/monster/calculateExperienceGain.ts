export const calculateExperienceGain = (baseExp: number, enemyLevel: number) => Math.round((baseExp * enemyLevel) / 7);
