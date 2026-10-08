import { IMAGINARIUM_STELLAS_PER_REWARD } from "#src/services/imaginarium/constants";

// The rewards a run's Stellas have earned so far, one for every three
export const countImaginariumStellaRewards = (stellas: number): number =>
  Math.floor(stellas / IMAGINARIUM_STELLAS_PER_REWARD);
