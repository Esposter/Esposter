import type { OreHit } from "#src/models/gathering/OreHit";
import type { OrePoiseRequirement } from "#src/models/gathering/OrePoiseRequirement";

// An ore's broken share after one hit: a blunt hit adds its poise damage over the ore's blunt requirement, a melee hit
// Over its melee one, and any other hit adds nothing. The share stops at one, which is the break
export const strikeOre = (brokenShare: number, hit: OreHit, requirement: OrePoiseRequirement): number => {
  if (hit.isBlunt) return Math.min(1, brokenShare + hit.poiseDamage / requirement.blunt);
  if (hit.isMelee) return Math.min(1, brokenShare + hit.poiseDamage / requirement.melee);
  return brokenShare;
};
