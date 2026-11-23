import { ASCENSION_PHASE_COUNT } from "genshin-interface/constants";

// The most ranks a weapon refines to; a refinement that would pass it loses what is past
export const MAX_WEAPON_REFINEMENT = 5;
// The EXP one Mora pays for when a weapon is levelled, ten points of EXP for each Mora as the wiki's Weapon EXP page
// Gives It, a rate the dump holds no table of
export const EXP_PER_MORA = 10;
// The share of a fodder weapon's own levelling EXP it gives back at no Mora, eighty percent as the wiki's Weapon EXP
// Page Gives it, a share the dump holds no table of
export const FODDER_EXP_SHARE = 0.8;
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
