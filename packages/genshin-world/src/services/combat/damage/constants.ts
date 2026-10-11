import type { ElementalMasteryCurve } from "#src/models/combat/ElementalMasteryCurve";

import { Attribute } from "#src/models/character/Attribute";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";

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
// An attacker of level A has 5A + 500 defence against which an enemy's defence is taken off, so the share of damage left
// Is (5A + 500) / (defence + 5A + 500) before any defence is reduced or ignored
export const ATTACKER_LEVEL_DEFENSE_SCALE = 5;
export const ATTACKER_LEVEL_DEFENSE_OFFSET = 500;
// Superconduct takes 40% off its target's Physical RES for 12 seconds
export const SUPERCONDUCT_PHYSICAL_RESISTANCE_REDUCTION = 0.4;
export const SUPERCONDUCT_SECONDS = 12;
export const SUPERCONDUCT_STATUS_ID = "superconduct";
// Every attribute a hit's DMG Bonus is read from, each element's and the Physical one, which a bonus to all DMG raises
export const DAMAGE_BONUS_ATTRIBUTES: readonly Attribute[] = Object.freeze([
  ...Object.values(ElementDamageBonusAttributeMap),
  Attribute.PhysicalDamageBonus,
]);
// Elemental mastery raises Lunar damage by 6 × mastery / (mastery + 2000), as the Damage page of the Genshin Impact Wiki
// And gcsim's (MIT) pkg/core/combat/reaction.go give it
// Https://genshin-impact.fandom.com/wiki/Damage#Lunar_and_Stellar_Glimmer_Reactions
export const LUNAR_ELEMENTAL_MASTERY_CURVE: ElementalMasteryCurve = Object.freeze({ offset: 2000, scale: 6 });
// A Lunar reaction's own hit sums its contributors' damage, the largest first, each weighted by its place here, and is a
// CRIT hit where the largest was, as gcsim (MIT) pkg/reactable/lunarcharged.go weighs them
// Https://github.com/genshinsim/gcsim/blob/main/pkg/reactable/lunarcharged.go
export const LUNAR_CONTRIBUTION_WEIGHTS: readonly number[] = [0.6, 0.3, 0.05, 0.05];
