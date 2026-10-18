import {
  STELLAR_VORTEX_LEVEL_ONE_COEFFICIENT,
  STELLAR_VORTEX_LEVEL_TWO_COEFFICIENT,
  STELLAR_VORTEX_LEVEL_TWO_STACKS,
} from "#src/services/combat/damage/constants";

// The Base Reaction Coefficient of a Stellar Vortex's explosion by its stacks of Stellar Swirl, from the wiki's Damage page:
// A Lv. 1 vortex at its first two stacks (2), a Lv. 2 vortex from the third (3), and nothing with no stack
export const getStellarVortexCoefficient = (stacks: number): number => {
  if (stacks < 1) return 0;
  return stacks < STELLAR_VORTEX_LEVEL_TWO_STACKS
    ? STELLAR_VORTEX_LEVEL_ONE_COEFFICIENT
    : STELLAR_VORTEX_LEVEL_TWO_COEFFICIENT;
};
