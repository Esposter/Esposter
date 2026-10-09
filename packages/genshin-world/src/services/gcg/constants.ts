import { Element, Elements } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";

// The faces a die shows when rolled: each of the seven elements and Omni, each equally likely
export const GCG_DIE_FACES: (Element | GcgDieFace)[] = [...Elements, GcgDieFace.Omni];
// The dice a side rolls at the start of each round, and the cards a side is dealt before the duel's first round
export const GCG_DICE_COUNT = 8;
// The supports a side's zone holds at most
export const GCG_SUPPORT_LIMIT = 4;
// The most dice a side holds at once: a die created past it is not made
export const GCG_DICE_LIMIT = 16;
export const GCG_STARTING_HAND_COUNT = 5;
// The die a switch of character costs, of any face
export const GCG_SWITCH_DICE_COUNT = 1;
// The round a duel concedes after: once its end phase closes the fifteenth round, neither side wins
export const GCG_ROUND_LIMIT = 15;
// The shield a character holds at most, and the points one Crystallize grants to its user's active character
export const GCG_SHIELD_LIMIT = 2;
export const GCG_CRYSTALLIZE_SHIELD = 1;
// The damage a Frozen character takes more from a Pyro or Physical hit, which removes its Frozen status
export const GCG_FROZEN_BONUS = 2;
// The piercing damage a Superconduct or an Electro-Charged deals to each other opposing character, and the damage a
// Swirl spreads to each of them
export const GCG_PIERCING_DAMAGE = 1;
export const GCG_SPREAD_DAMAGE = 1;
// The elements that apply an aura to the character they hit. Anemo and Geo react with an aura but never apply one
export const GCG_AURA_ELEMENTS: Element[] = [
  Element.Cryo,
  Element.Dendro,
  Element.Electro,
  Element.Hydro,
  Element.Pyro,
];
// The damage each reaction adds to the instance it triggers on
export const GcgReactionKindBonusMap: Record<GcgReactionKind, number> = {
  [GcgReactionKind.Bloom]: 1,
  [GcgReactionKind.Burning]: 1,
  [GcgReactionKind.Crystallize]: 1,
  [GcgReactionKind.ElectroCharged]: 1,
  [GcgReactionKind.Frozen]: 1,
  [GcgReactionKind.Melt]: 2,
  [GcgReactionKind.Overloaded]: 2,
  [GcgReactionKind.Quicken]: 1,
  [GcgReactionKind.Superconduct]: 1,
  [GcgReactionKind.Swirl]: 0,
  [GcgReactionKind.Vaporize]: 2,
};
// The element pair each reaction is made of, as the standard rule lists them, in either order
export const GcgReactionPairs: [Element, Element, GcgReactionKind][] = [
  [Element.Cryo, Element.Pyro, GcgReactionKind.Melt],
  [Element.Hydro, Element.Pyro, GcgReactionKind.Vaporize],
  [Element.Electro, Element.Pyro, GcgReactionKind.Overloaded],
  [Element.Electro, Element.Cryo, GcgReactionKind.Superconduct],
  [Element.Electro, Element.Hydro, GcgReactionKind.ElectroCharged],
  [Element.Cryo, Element.Hydro, GcgReactionKind.Frozen],
  [Element.Anemo, Element.Cryo, GcgReactionKind.Swirl],
  [Element.Anemo, Element.Hydro, GcgReactionKind.Swirl],
  [Element.Anemo, Element.Pyro, GcgReactionKind.Swirl],
  [Element.Anemo, Element.Electro, GcgReactionKind.Swirl],
  [Element.Geo, Element.Cryo, GcgReactionKind.Crystallize],
  [Element.Geo, Element.Hydro, GcgReactionKind.Crystallize],
  [Element.Geo, Element.Pyro, GcgReactionKind.Crystallize],
  [Element.Geo, Element.Electro, GcgReactionKind.Crystallize],
  [Element.Pyro, Element.Dendro, GcgReactionKind.Burning],
  [Element.Hydro, Element.Dendro, GcgReactionKind.Bloom],
  [Element.Electro, Element.Dendro, GcgReactionKind.Quicken],
];
// The element or physical damage each damage effect's name spells: Physic is Physical, and the game spells the other six
// Elements its own way, which the world's Element enum spells otherwise
export const GcgEffectDamageNameMap: Map<string, Element | GcgDamageKind> = new Map<string, Element | GcgDamageKind>([
  ["Physic", GcgDamageKind.Physical],
  ["Fire", Element.Pyro],
  ["Water", Element.Hydro],
  ["Ice", Element.Cryo],
  ["Electric", Element.Electro],
  ["Wind", Element.Anemo],
  ["Rock", Element.Geo],
  ["Grass", Element.Dendro],
]);
// The name of a shared damage effect, its element or Physic and its damage: Effect_Damage_Fire_3 names Fire and 3
export const GCG_EFFECT_DAMAGE_PATTERN = /^Effect_Damage_(?<element>\w+)_(?<count>\d+)$/u;
// The cards the reactions leave on their attacker's side: Burning Flame as a summon that stacks to two usages, and Dendro
// Core and Catalyzing Field onstage, each with the usages it holds once it is left
export const GCG_BURNING_FLAME_ID = 115;
export const GCG_BURNING_FLAME_MAX_USAGES = 2;
export const GCG_DENDRO_CORE_ID = 116;
export const GCG_DENDRO_CORE_MAX_USAGES = 1;
export const GCG_CATALYZING_FIELD_ID = 117;
export const GCG_CATALYZING_FIELD_MAX_USAGES = 2;
