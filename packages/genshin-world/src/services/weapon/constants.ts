import { ASCENSION_PHASE_COUNT } from "genshin-interface/constants";

// The most ranks a weapon refines to; a refinement that would pass it loses what is past
export const MAX_WEAPON_REFINEMENT = 5;
// The EXP each ten points of Mora pay for, and the share of a fodder weapon's own levelling EXP it gives back
export const EXP_PER_MORA = 10;
export const FODDER_EXP_SHARE = 0.8;
// The Enhancement Ores, largest first, each with the EXP it gives a weapon, by its id in the game's tables
export const ENHANCEMENT_ORES: readonly { exp: number; id: number }[] = [
  { exp: 10000, id: 104013 },
  { exp: 2000, id: 104012 },
  { exp: 400, id: 104011 },
];
// The phases an ascension's sparks count from the first, each one lit once the weapon holds it
export const SPARK_PHASES = Array.from({ length: ASCENSION_PHASE_COUNT }, (_value, index) => index + 1);
// The slots the Enhance strip shows across its width, each an ore or fodder weapon or an empty slot waiting for one
export const ENHANCE_SLOT_COUNT = 7;
// The materials the Enhance panel's consumed line counts its picks against, the total the game's panel shows
export const ENHANCE_MATERIAL_LIMIT = 40;
// The share of the shared divider's silver the game's hairline reads at over the weapon's scene
export const DIVIDER_OPACITY = 0.16;
// The dot the game's Current line opens on, which each passive row draws as its bullet instead
export const CURRENT_DOT_REGEX = /^·/u;
