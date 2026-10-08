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
