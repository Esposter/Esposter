import { LUNAR_CONTRIBUTION_WEIGHTS } from "#src/services/combat/damage/constants";

// A Lunar reaction's own hit before the target's RES, from its contributors' damage, each priced alone with its own CRIT:
// The largest first, each weighted by its place, and a fifth contributor or more adding nothing
export const sumLunarContributions = (damages: readonly number[]): number =>
  damages
    .toSorted((first, second) => second - first)
    .reduce((total, damage, index) => total + damage * (LUNAR_CONTRIBUTION_WEIGHTS[index] ?? 0), 0);
