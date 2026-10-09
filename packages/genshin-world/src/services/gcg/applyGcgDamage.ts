import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgOutcome } from "#src/models/gcg/GcgOutcome";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";
import { burningFlame } from "#src/services/gcg/cards/burningFlame";
import { catalyzingField } from "#src/services/gcg/cards/catalyzingField";
import { dendroCore } from "#src/services/gcg/cards/dendroCore";
import {
  GCG_AURA_ELEMENTS,
  GCG_BURNING_FLAME_ID,
  GCG_BURNING_FLAME_MAX_USAGES,
  GCG_CATALYZING_FIELD_ID,
  GCG_CATALYZING_FIELD_MAX_USAGES,
  GCG_CRYSTALLIZE_SHIELD,
  GCG_DENDRO_CORE_ID,
  GCG_DENDRO_CORE_MAX_USAGES,
  GCG_FROZEN_BONUS,
  GCG_PIERCING_DAMAGE,
  GCG_SHIELD_LIMIT,
  GCG_SPREAD_DAMAGE,
  GcgReactionKindBonusMap,
} from "#src/services/gcg/constants";
import { checkIsGcgElementImmune } from "#src/services/gcg/effects/checkIsGcgElementImmune";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { findGcgPermanentAura } from "#src/services/gcg/effects/findGcgPermanentAura";
import { findGcgAdjacentCharacterIndex } from "#src/services/gcg/findGcgAdjacentCharacterIndex";
import { getGcgReactionKind } from "#src/services/gcg/getGcgReactionKind";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { reduceGcgReceivedDamage } from "#src/services/gcg/reduceGcgReceivedDamage";
import { takeOne } from "@esposter/shared";

// One damage a skill deals to the opposing active character, from the side at sourceSideIndex. An element applies its aura
// Or reacts with the aura there, a reaction's damage and effects settle with it, and a defeated character is cleared, with
// A side that has none standing losing the duel, and a side whose active fell with one standing owing a replacement
export const applyGcgDamage = (duel: GcgDuel, sourceSideIndex: number, damage: GcgDamage, rule: GcgRule): void => {
  const targetSideIndex = 1 - sourceSideIndex;
  const standingBefore = listGcgStandingCharacters(duel);
  const hit = takeOne(duel.sides, targetSideIndex).characters.at(takeOne(duel.sides, targetSideIndex).activeIndex);
  if (hit) hitGcgCharacter(duel, sourceSideIndex, hit, reduceGcgReceivedDamage(duel, targetSideIndex, damage), rule);
  settleGcgDefeats(duel, standingBefore);
  for (const side of duel.sides) pruneGcgZoneCards(side);
};

const hitGcgCharacter = (
  duel: GcgDuel,
  sourceSideIndex: number,
  hit: GcgCharacterState,
  damage: GcgDamage,
  rule: GcgRule,
): void => {
  if (damage.damageType === GcgDamageKind.Piercing) hurtGcgCharacter(hit, damage.value, true);
  else if (damage.damageType === GcgDamageKind.Physical)
    hurtGcgCharacter(hit, damage.value + takeGcgFrozenBonus(hit, damage.damageType), false);
  else if (!checkIsGcgElementImmune([...hit.equipments, ...hit.statuses], damage.damageType)) {
    applyGcgElementalDamage(duel, sourceSideIndex, hit, damage.damageType, damage.value, rule);
    const permanentAura = findGcgPermanentAura([...hit.equipments, ...hit.statuses]);
    if (permanentAura !== undefined) hit.aura = permanentAura;
  }
};

// An elemental hit: its Frozen bonus, then the reaction its aura makes with the element if the rule lists one, which
// Consumes the aura, adds its damage and leaves its effects. Otherwise the element applies its aura, when it is one that
// Applies
const applyGcgElementalDamage = (
  duel: GcgDuel,
  sourceSideIndex: number,
  hit: GcgCharacterState,
  element: Element,
  value: number,
  rule: GcgRule,
): void => {
  const aura = hit.aura;
  const reaction = aura === GcgAura.None ? undefined : getGcgReactionKind(rule, aura, element);
  let damageValue = value + takeGcgFrozenBonus(hit, element);
  if (aura === GcgAura.None || reaction === undefined) {
    if (GCG_AURA_ELEMENTS.includes(element)) hit.aura = element;
    hurtGcgCharacter(hit, damageValue, false);
    return;
  }
  damageValue += GcgReactionKindBonusMap[reaction];
  hit.aura = GcgAura.None;
  if (reaction === GcgReactionKind.Frozen) hit.isFrozen = true;
  hurtGcgCharacter(hit, damageValue, false);
  applyGcgReactionEffects(duel, sourceSideIndex, hit, reaction, aura);
};

// The effects a reaction leaves after its hit: the piercing and the spread it sends to the other opposing characters, the
// Shield its user's active character gains, the forced switch of an Overloaded active character, and the card a Burning,
// Bloom or Quicken leaves on its user's side
const applyGcgReactionEffects = (
  duel: GcgDuel,
  sourceSideIndex: number,
  hit: GcgCharacterState,
  reaction: GcgReactionKind,
  aura: Element,
): void => {
  const sourceSide = takeOne(duel.sides, sourceSideIndex);
  const targetSide = takeOne(duel.sides, 1 - sourceSideIndex);
  const otherTargets = targetSide.characters.filter((character) => character !== hit && character.hp > 0);
  if (reaction === GcgReactionKind.Superconduct || reaction === GcgReactionKind.ElectroCharged)
    for (const other of otherTargets) hurtGcgCharacter(other, GCG_PIERCING_DAMAGE, true);
  else if (reaction === GcgReactionKind.Swirl)
    for (const other of otherTargets)
      hurtGcgCharacter(other, GCG_SPREAD_DAMAGE + takeGcgFrozenBonus(other, aura), false);
  else if (reaction === GcgReactionKind.Burning)
    addGcgReactionCard(sourceSide.summons, GCG_BURNING_FLAME_ID, burningFlame, GCG_BURNING_FLAME_MAX_USAGES);
  else if (reaction === GcgReactionKind.Bloom)
    addGcgReactionCard(sourceSide.onstages, GCG_DENDRO_CORE_ID, dendroCore, GCG_DENDRO_CORE_MAX_USAGES);
  else if (reaction === GcgReactionKind.Quicken)
    addGcgReactionCard(sourceSide.onstages, GCG_CATALYZING_FIELD_ID, catalyzingField, GCG_CATALYZING_FIELD_MAX_USAGES);
  else if (reaction === GcgReactionKind.Crystallize) {
    const user = sourceSide.characters.at(sourceSide.activeIndex);
    if (user) user.shield = Math.min(GCG_SHIELD_LIMIT, user.shield + GCG_CRYSTALLIZE_SHIELD);
  } else if (reaction === GcgReactionKind.Overloaded && hit.hp > 0) {
    const nextIndex = findGcgAdjacentCharacterIndex(targetSide, targetSide.activeIndex, 1);
    if (nextIndex !== undefined) targetSide.activeIndex = nextIndex;
  }
};

// A reaction's card joins the field it is left on, or, when the field holds one already, gains the usages it starts with up
// To the most it holds
const addGcgReactionCard = (
  zoneCards: GcgZoneCard[],
  cardId: number,
  module: GcgCardModule,
  maxUsages: number,
): void => {
  const zoneCard = zoneCards.find((candidate) => candidate.cardId === cardId);
  if (zoneCard) zoneCard.usages = Math.min(maxUsages, zoneCard.usages + (module.initialUsages ?? 0));
  else zoneCards.push(createGcgZoneCard(cardId, module));
};

// A Frozen character takes more from a Pyro or Physical hit, which removes its Frozen status. Nothing else breaks it
const takeGcgFrozenBonus = (character: GcgCharacterState, damageType: Element | GcgDamageKind): number => {
  if (!character.isFrozen || (damageType !== Element.Pyro && damageType !== GcgDamageKind.Physical)) return 0;
  character.isFrozen = false;
  return GCG_FROZEN_BONUS;
};

// A hit takes its shield's points off first, unless it is piercing, and a character at no HP takes nothing more
const hurtGcgCharacter = (character: GcgCharacterState, value: number, isPiercing: boolean): void => {
  if (character.hp <= 0) return;
  let remainingValue = value;
  if (!isPiercing) {
    const absorbedValue = Math.min(character.shield, remainingValue);
    character.shield -= absorbedValue;
    remainingValue -= absorbedValue;
  }
  character.hp = Math.max(0, character.hp - remainingValue);
};

// Clears what each character at no HP held, asks a side for a replacement when its active fell and another stands, and
// Ends the duel for the other side once a side has none standing
const settleGcgDefeats = (duel: GcgDuel, standingBefore: boolean[][]): void => {
  for (const [sideIndex, side] of duel.sides.entries()) {
    for (const [characterIndex, character] of side.characters.entries()) {
      if (character.hp > 0) continue;
      if (standingBefore[sideIndex]?.[characterIndex]) side.hasDefeatedCharacter = true;
      character.aura = GcgAura.None;
      character.energy = 0;
      character.isFrozen = false;
      character.shield = 0;
    }
    const isStanding = side.characters.some((character) => character.hp > 0);
    const active = side.characters.at(side.activeIndex);
    if (isStanding && active && active.hp <= 0) side.isReplacementPending = true;
    if (!isStanding) {
      duel.phase = GcgPhase.Ended;
      duel.outcome = GcgOutcome.Victory;
      duel.winnerSideIndex = 1 - sideIndex;
    }
  }
};

// A piercing hit on each opposing character on standby, which no shield stops, as a skill's after-effect deals it past its
// Target. A defeated character is cleared, as an active one's would be
export const applyGcgStandbyPiercing = (duel: GcgDuel, sourceSideIndex: number, value: number): void => {
  const standingBefore = listGcgStandingCharacters(duel);
  const targetSide = takeOne(duel.sides, 1 - sourceSideIndex);
  for (const [index, character] of targetSide.characters.entries())
    if (index !== targetSide.activeIndex) hurtGcgCharacter(character, value, true);
  settleGcgDefeats(duel, standingBefore);
  for (const side of duel.sides) pruneGcgZoneCards(side);
};

// Whether each character on each side stands before a hit lands, so a settle can tell the characters it defeats
const listGcgStandingCharacters = (duel: GcgDuel): boolean[][] =>
  duel.sides.map((side) => side.characters.map((character) => character.hp > 0));
