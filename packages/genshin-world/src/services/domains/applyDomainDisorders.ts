import type { Reaction } from "#src/models/combat/Reaction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";

// The source a disorder's bonus is given under, so the leave ends the disorders' bonuses and no other buff
export const DOMAIN_DISORDER_SOURCE = "domainDisorder";

// The reactions each element takes part in, by the wiki's element pairs: the Elemental Reaction table
// (https://genshin-impact.fandom.com/wiki/Elemental_Reaction) and the Lunar Reaction list (https://genshin-impact.fandom.com/wiki/Lunar_Reaction).
// A reaction is related to each element in its pair, and Shattered is both Hydro's and Cryo's, as its Frozen target is. The item
// Descriptions that use the phrase read the same way: Frostbreath's Cryo or Hydro-related reaction, Molten Iron Fortress's Dendro-related one
const HYDRO_REACTIONS: ReadonlySet<ReactionType> = new Set([
  ReactionType.Vaporize,
  ReactionType.ElectroCharged,
  ReactionType.Frozen,
  ReactionType.Shattered,
  ReactionType.Bloom,
  ReactionType.LunarBloom,
  ReactionType.LunarCharged,
  ReactionType.LunarCrystallize,
]);
const CRYO_REACTIONS: ReadonlySet<ReactionType> = new Set([
  ReactionType.Melt,
  ReactionType.Superconduct,
  ReactionType.Frozen,
  ReactionType.Shattered,
]);
const DENDRO_REACTIONS: ReadonlySet<ReactionType> = new Set([
  ReactionType.Burning,
  ReactionType.Quicken,
  ReactionType.Aggravate,
  ReactionType.Spread,
  ReactionType.Bloom,
  ReactionType.Burgeon,
  ReactionType.Hyperbloom,
  ReactionType.LunarBloom,
]);
// Whether a reaction is one of a set's, or the Swirl or Crystallize that carries the element it is related to
const involvesElement =
  (reactionTypes: ReadonlySet<ReactionType>, element?: Element) =>
  (reaction: Reaction): boolean =>
    reactionTypes.has(reaction.reactionType) ||
    (element !== undefined &&
      (reaction.reactionType === ReactionType.Swirl || reaction.reactionType === ReactionType.Crystallize) &&
      reaction.element === element);

interface DomainDisorderBase {
  amount: number;
  attribute: Attribute;
}
// The ley line disorders the fight models, in one table of three kinds (PROVISIONAL: the Nightsoul ones need the kits'
// Nightsoul primitive, which does not exist yet, and the rest are unmodelled, change nothing):
// - constant: a bonus on every member of the team for the whole challenge, given on enter
// - reaction: a bonus on every member when a reaction it names is triggered on an enemy, for its seconds
// - healthChange: a bonus on every member when a party member gains or loses HP, for its seconds
// A trigger inside the cooldown changes nothing. A disorder with maxStacks gives each trigger a stack of its own up to that
// Limit, each stack ending on its own clock. One without restarts its bonus on each trigger
export type DomainDisorder =
  | (DomainDisorderBase & { kind: "constant" })
  | (DomainDisorderBase & { cooldownSeconds: number; kind: "healthChange"; maxStacks?: number; seconds: number })
  | (DomainDisorderBase & {
      cooldownSeconds: number;
      kind: "reaction";
      matches: (reaction: Reaction) => boolean;
      maxStacks?: number;
      seconds: number;
    });
export const DOMAIN_DISORDERS: Readonly<Record<string, DomainDisorder>> = {
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
  LevelBuff_TowerBuff_GrassReaction_ElemMasteryDelta: {
    amount: 150,
    attribute: Attribute.ElementalMastery,
    cooldownSeconds: 1,
    kind: "reaction",
    matches: involvesElement(DENDRO_REACTIONS),
    seconds: 8,
  },
  "LevelEntity_LoopDungeon_MasteryUp_WindDamageUp_V3.3": {
    amount: 0.5,
    attribute: Attribute.AnemoDamageBonus,
    cooldownSeconds: 0,
    kind: "reaction",
    matches: (reaction) => reaction.reactionType === ReactionType.Swirl,
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
  LevelEntity_Avatar_CriticalUp: { amount: 0.5, attribute: Attribute.CriticalRate, kind: "constant" },
  LevelEntity_ElementAddHurt_Electric: { amount: 0.75, attribute: Attribute.ElectroDamageBonus, kind: "constant" },
  LevelEntity_ElementAddHurt_Fire: { amount: 0.75, attribute: Attribute.PyroDamageBonus, kind: "constant" },
  LevelEntity_ElementAddHurt_Ice: { amount: 0.75, attribute: Attribute.CryoDamageBonus, kind: "constant" },
  LevelEntity_ElementAddHurt_Rock: { amount: 0.75, attribute: Attribute.GeoDamageBonus, kind: "constant" },
  LevelEntity_ElementAddHurt_Water: { amount: 0.75, attribute: Attribute.HydroDamageBonus, kind: "constant" },
  LevelEntity_PhysicalAddHurt: { amount: 0.75, attribute: Attribute.PhysicalDamageBonus, kind: "constant" },
};

// What a triggered disorder may trigger on: a reaction an enemy took, or a change to a party member's HP
export type DomainDisorderTrigger =
  | { healthShare: number; kind: "healthChange" }
  | { kind: "reaction"; reactions: readonly Reaction[] };

// The source of one stack of a disorder's bonus, so each stack ends apart and the leave ends every one of them
export const getDomainDisorderSource = (disorder: string, stack: number): string =>
  `${DOMAIN_DISORDER_SOURCE}:${disorder}:${stack}`;

// The first stack of a disorder no buff of the team holds, or none where all of its stacks are given
const findFreeStack = (kitEffectState: KitEffectState, disorder: string, maxStacks: number): number | undefined => {
  for (let stack = 0; stack < maxStacks; stack++) {
    const source = getDomainDisorderSource(disorder, stack);
    if (!kitEffectState.effects.some((effect) => effect.kind === "buff" && effect.source === source)) return stack;
  }
  return undefined;
};

// Gives every member of the deployed team a constant disorder's bonus, for the seconds the challenge is given
export const applyDomainDisorder = (
  kitEffectState: KitEffectState,
  party: Party,
  disorder: string,
  seconds: number,
): void => {
  const definition = DOMAIN_DISORDERS[disorder];
  if (definition?.kind !== "constant") return;
  buffKitTeam(kitEffectState, party, {
    amount: definition.amount,
    attribute: definition.attribute,
    secondsRemaining: seconds,
    source: getDomainDisorderSource(disorder, 0),
  });
};

// Whether a trigger is one the disorder answers to: a change to HP of either sign, or a reaction its predicate names
const isTriggeredBy = (
  definition: Exclude<DomainDisorder, { kind: "constant" }>,
  trigger: DomainDisorderTrigger,
): boolean => {
  if (definition.kind === "healthChange") return trigger.kind === "healthChange" && trigger.healthShare !== 0;
  return trigger.kind === "reaction" && trigger.reactions.some(definition.matches);
};

// Gives the team a triggered disorder's bonus when its trigger lands, and returns the seconds the disorder may trigger again
// From: a trigger inside its cooldown, or one with every stack given, changes nothing and keeps the seconds it was given
export const triggerDomainDisorder = (
  kitEffectState: KitEffectState,
  party: Party,
  disorder: string,
  trigger: DomainDisorderTrigger,
  nowSeconds: number,
  readySeconds: number,
): number => {
  const definition = DOMAIN_DISORDERS[disorder];
  if (!definition || definition.kind === "constant" || nowSeconds < readySeconds || !isTriggeredBy(definition, trigger))
    return readySeconds;
  const stack = definition.maxStacks === undefined ? 0 : findFreeStack(kitEffectState, disorder, definition.maxStacks);
  if (stack === undefined) return readySeconds;
  buffKitTeam(kitEffectState, party, {
    amount: definition.amount,
    attribute: definition.attribute,
    secondsRemaining: definition.seconds,
    source: getDomainDisorderSource(disorder, stack),
  });
  return nowSeconds + definition.cooldownSeconds;
};

// Ends the disorders' bonuses, the team leaving the arena or the challenge ending, and no other buff
export const clearDomainDisorders = (kitEffectState: KitEffectState): void => {
  kitEffectState.effects = kitEffectState.effects.filter(
    (effect) => effect.kind !== "buff" || !effect.source?.startsWith(DOMAIN_DISORDER_SOURCE),
  );
};
