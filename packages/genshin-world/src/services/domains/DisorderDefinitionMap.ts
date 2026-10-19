import type { DomainDisorder } from "#src/models/domains/DomainDisorder";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { involvesElement } from "#src/services/domains/involvesElement";

// The reactions each element takes part in, by the wiki's element pairs: the Elemental Reaction table
// (https://genshin-impact.fandom.com/wiki/Elemental_Reaction) and the Lunar Reaction list (https://genshin-impact.fandom.com/wiki/Lunar_Reaction).
// A reaction is related to each element in its pair, and Shattered is both Hydro's and Cryo's, as its Frozen target is. The item
// Descriptions that use the phrase read the same way: Frostbreath's Cryo or Hydro-related reaction, Molten Iron Fortress's Dendro-related one
const HYDRO_REACTIONS: ReadonlySet<ReactionType> = new Set([
  ReactionType.Bloom,
  ReactionType.ElectroCharged,
  ReactionType.Frozen,
  ReactionType.LunarBloom,
  ReactionType.LunarCharged,
  ReactionType.LunarCrystallize,
  ReactionType.Shattered,
  ReactionType.Vaporize,
]);
const CRYO_REACTIONS: ReadonlySet<ReactionType> = new Set([
  ReactionType.Frozen,
  ReactionType.Melt,
  ReactionType.Shattered,
  ReactionType.Superconduct,
]);
const DENDRO_REACTIONS: ReadonlySet<ReactionType> = new Set([
  ReactionType.Aggravate,
  ReactionType.Bloom,
  ReactionType.Burgeon,
  ReactionType.Burning,
  ReactionType.Hyperbloom,
  ReactionType.LunarBloom,
  ReactionType.Quicken,
  ReactionType.Spread,
]);

// The ley line disorders the fight models, by the game's name for each
export const DisorderDefinitionMap: Readonly<Record<string, DomainDisorder>> = {
  LevelBuff_LoopDungeon_ElementAddHurt_Water: {
    amount: 0.1,
    attribute: Attribute.HydroDamageBonus,
    cooldownSeconds: 2,
    kind: "reaction",
    matches: involvesElement(HYDRO_REACTIONS, Element.Hydro),
    maxStacks: 5,
    seconds: 10,
  },
  LevelBuff_LoopDungeon_ElemReactIce_7_0: {
    amount: 250,
    attribute: Attribute.ElementalMastery,
    cooldownSeconds: 0,
    kind: "reaction",
    matches: involvesElement(CRYO_REACTIONS, Element.Cryo),
    seconds: 10,
  },
  LevelBuff_LoopDungeon_HpUpOrDown_CriticalHurtUp: {
    amount: 0.07,
    attribute: Attribute.CriticalDamage,
    cooldownSeconds: 0.1,
    kind: "healthChange",
    maxStacks: 10,
    seconds: 10,
  },
  LevelBuff_TowerBuff_GrassReaction_ElemMasteryDelta: {
    amount: 150,
    attribute: Attribute.ElementalMastery,
    cooldownSeconds: 1,
    kind: "reaction",
    matches: involvesElement(DENDRO_REACTIONS),
    seconds: 8,
  },
  LevelEntity_Avatar_CriticalUp: { amount: 0.5, attribute: Attribute.CriticalRate, kind: "constant" },
  LevelEntity_ElementAddHurt_Electric: { amount: 0.75, attribute: Attribute.ElectroDamageBonus, kind: "constant" },
  LevelEntity_ElementAddHurt_Fire: { amount: 0.75, attribute: Attribute.PyroDamageBonus, kind: "constant" },
  LevelEntity_ElementAddHurt_Ice: { amount: 0.75, attribute: Attribute.CryoDamageBonus, kind: "constant" },
  LevelEntity_ElementAddHurt_Rock: { amount: 0.75, attribute: Attribute.GeoDamageBonus, kind: "constant" },
  LevelEntity_ElementAddHurt_Water: { amount: 0.75, attribute: Attribute.HydroDamageBonus, kind: "constant" },
  "LevelEntity_LoopDungeon_MasteryUp_WindDamageUp_V3.3": {
    amount: 0.5,
    attribute: Attribute.AnemoDamageBonus,
    cooldownSeconds: 0,
    kind: "reaction",
    matches: (reaction) => reaction.reactionType === ReactionType.Swirl,
    seconds: 10,
  },
  LevelEntity_PhysicalAddHurt: { amount: 0.75, attribute: Attribute.PhysicalDamageBonus, kind: "constant" },
};
