import type { ElementalMasteryCurve } from "#src/models/combat/ElementalMasteryCurve";

// How elemental mastery raises each kind of reaction: an amplifying reaction's multiplier, a transformative reaction's
// Damage, the catalyze bonus, and a Crystallize shield's health
export const AMPLIFYING_ELEMENTAL_MASTERY_CURVE: ElementalMasteryCurve = Object.freeze({ offset: 1400, scale: 2.78 });
export const TRANSFORMATIVE_ELEMENTAL_MASTERY_CURVE: ElementalMasteryCurve = Object.freeze({ offset: 2000, scale: 16 });
export const CATALYZE_ELEMENTAL_MASTERY_CURVE: ElementalMasteryCurve = Object.freeze({ offset: 1200, scale: 5 });
export const CRYSTALLIZE_ELEMENTAL_MASTERY_CURVE: ElementalMasteryCurve = Object.freeze({ offset: 1400, scale: 4.44 });
// An amplifying reaction doubles its hit where the trigger consumes twice its gauge of the aura, Hydro's Vaporize and
// Pyro's Melt, and multiplies it by 1.5 the other way round
export const FORWARD_AMPLIFYING_MULTIPLIER = 2;
export const REVERSE_AMPLIFYING_MULTIPLIER = 1.5;
// An enemy of level L has 5L + 500 defence, against an attacker of level A taking off defence / (defence + 5A + 500), so
// The share of damage left is (A + 100) / (A + 100 + L + 100) before any defence is reduced or ignored
export const DEFENSE_LEVEL_OFFSET = 100;
