import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgRule } from "#src/models/gcg/GcgRule";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgOutcome } from "#src/models/gcg/GcgOutcome";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import {
  GCG_AURA_ELEMENTS,
  GCG_FROZEN_BONUS,
  GCG_PIERCING_DAMAGE,
  GCG_SPREAD_DAMAGE,
  GcgReactionKindBonusMap,
} from "#src/services/gcg/constants";
import { checkIsGcgElementImmune } from "#src/services/gcg/effects/checkIsGcgElementImmune";
import { applyGcgNonDamageReactionEffects } from "#src/services/gcg/effects/applyGcgNonDamageReactionEffects";
import { findGcgPermanentAura } from "#src/services/gcg/effects/findGcgPermanentAura";
import { findGcgZoneCardOwner } from "#src/services/gcg/effects/findGcgZoneCardOwner";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { modifyGcgDamageDealt } from "#src/services/gcg/effects/modifyGcgDamageDealt";
import { getGcgReactionKind } from "#src/services/gcg/getGcgReactionKind";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { reduceGcgReceivedDamage } from "#src/services/gcg/reduceGcgReceivedDamage";
import { takeOne } from "@esposter/shared";

// One damage a skill deals to the opposing active character, from the side at sourceSideIndex. An element applies its aura
// Or reacts with the aura there, a reaction's damage and effects settle with it, and a defeated character is cleared, with
// A side that has none standing losing the duel, and a side whose active fell with one standing owing a replacement. It
// Returns each hit it landed on a standing character, with the reaction that hit triggered
export const applyGcgDamage = (
  duel: GcgDuel,
  sourceSideIndex: number,
  damage: GcgDamage,
  rule: GcgRule,
  context: GcgEffectContext = { duel, sideIndex: sourceSideIndex },
): GcgDealtDamage[] => {
  const targetSideIndex = 1 - sourceSideIndex;
  const standingBefore = listGcgStandingCharacters(duel);
  const dealt: GcgDealtDamage[] = [];
  const hit = takeOne(duel.sides, targetSideIndex).characters.at(takeOne(duel.sides, targetSideIndex).activeIndex);
  if (hit)
    hitGcgCharacter(
      duel,
      sourceSideIndex,
      hit,
      reduceGcgReceivedDamage(duel, targetSideIndex, damage),
      rule,
      dealt,
      context,
    );
  settleGcgDefeats(duel, standingBefore);
  for (const side of duel.sides) pruneGcgZoneCards(side);
  return dealt;
};

const hitGcgCharacter = (
  duel: GcgDuel,
  sourceSideIndex: number,
  hit: GcgCharacterState,
  damage: GcgDamage,
  rule: GcgRule,
  dealt: GcgDealtDamage[],
  context: GcgEffectContext,
): void => {
  if (damage.damageType === GcgDamageKind.Piercing) {
    recordGcgHit(dealt, hit, damage.damageType);
    hurtGcgCharacter(hit, damage.value, true);
  } else if (damage.damageType === GcgDamageKind.Physical) {
    recordGcgHit(dealt, hit, damage.damageType);
    hurtGcgCharacter(hit, damage.value + takeGcgFrozenBonus(hit, damage.damageType), false);
  } else if (!checkIsGcgElementImmune([...hit.equipments, ...hit.statuses], damage.damageType)) {
    applyGcgElementalDamage(duel, sourceSideIndex, hit, damage.damageType, damage.value, rule, dealt, context);
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
  dealt: GcgDealtDamage[],
  context: GcgEffectContext,
): void => {
  const aura = hit.aura;
  const reaction = aura === GcgAura.None ? undefined : getGcgReactionKind(rule, aura, element);
  let damageValue = value + takeGcgFrozenBonus(hit, element);
  if (aura === GcgAura.None || reaction === undefined) {
    recordGcgHit(dealt, hit, element);
    if (GCG_AURA_ELEMENTS.includes(element)) hit.aura = element;
    hurtGcgCharacter(hit, damageValue, false);
    return;
  }
  recordGcgHit(dealt, hit, element, reaction);
  damageValue += GcgReactionKindBonusMap[reaction];
  hit.aura = GcgAura.None;
  hurtGcgCharacter(hit, damageValue, false);
  applyGcgReactionEffects(duel, sourceSideIndex, hit, reaction, aura, dealt, context);
};

// The effects a reaction leaves after its hit: the piercing and the spread it sends to the other opposing characters, and,
// Through the effects that deal no DMG, the rest of what it leaves
const applyGcgReactionEffects = (
  duel: GcgDuel,
  sourceSideIndex: number,
  hit: GcgCharacterState,
  reaction: GcgReactionKind,
  aura: Element,
  dealt: GcgDealtDamage[],
  context: GcgEffectContext,
): void => {
  const sourceSide = takeOne(duel.sides, sourceSideIndex);
  const targetSide = takeOne(duel.sides, 1 - sourceSideIndex);
  const otherTargets = targetSide.characters.filter((character) => character !== hit && character.hp > 0);
  if (reaction === GcgReactionKind.Superconduct || reaction === GcgReactionKind.ElectroCharged)
    for (const other of otherTargets) {
      recordGcgHit(dealt, other, GcgDamageKind.Piercing);
      hurtGcgCharacter(other, GCG_PIERCING_DAMAGE, true);
    }
  else if (reaction === GcgReactionKind.Swirl) {
    // Each spread hit is a damage its side deals, so the modifiers bear on it. It carries the skill's context, but not the
    // Plunging Attack bonus, which is the skill's own hit's
    for (const other of otherTargets) {
      const spread = modifyGcgDamageDealt(
        { duel, sideIndex: sourceSideIndex, skill: context.skill },
        { damageType: aura, value: GCG_SPREAD_DAMAGE },
      );
      recordGcgHit(dealt, other, spread.damageType);
      hurtGcgCharacter(other, spread.value + takeGcgFrozenBonus(other, spread.damageType), false);
    }
    for (const zoneCard of listGcgFieldCards(sourceSide, undefined))
      GcgCardIdModuleMap.get(zoneCard.cardId)?.onSwirl?.({ duel, sideIndex: sourceSideIndex }, zoneCard, aura);
  }
  applyGcgNonDamageReactionEffects(duel, sourceSideIndex, 1 - sourceSideIndex, hit, reaction);
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
  const defeatedSideIndices: number[] = [];
  for (const [sideIndex, side] of duel.sides.entries()) {
    for (const [characterIndex, character] of side.characters.entries()) {
      if (character.hp > 0) continue;
      if (standingBefore[sideIndex]?.[characterIndex]) {
        side.hasDefeatedCharacter = true;
        defeatedSideIndices.push(sideIndex);
      }
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
  for (const sideIndex of defeatedSideIndices) notifyGcgOpposingDefeat(duel, 1 - sideIndex);
};

// Tells the cards on a side's field that an opposing character was defeated, each with the index of the character it is
// Attached to
const notifyGcgOpposingDefeat = (duel: GcgDuel, sideIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  for (const zoneCard of listGcgFieldCards(side, undefined))
    GcgCardIdModuleMap.get(zoneCard.cardId)?.onOpposingDefeated?.(
      { characterIndex: findGcgZoneCardOwner(side.characters, zoneCard), duel, sideIndex },
      zoneCard,
    );
};

// A piercing hit on each opposing character on standby, which no shield stops, as a skill's after-effect deals it past its
// Target. A defeated character is cleared, as an active one's would be
export const applyGcgStandbyPiercing = (duel: GcgDuel, sourceSideIndex: number, value: number): GcgDealtDamage[] => {
  const standingBefore = listGcgStandingCharacters(duel);
  const targetSide = takeOne(duel.sides, 1 - sourceSideIndex);
  const dealt: GcgDealtDamage[] = [];
  for (const [index, character] of targetSide.characters.entries())
    if (index !== targetSide.activeIndex) {
      recordGcgHit(dealt, character, GcgDamageKind.Piercing);
      hurtGcgCharacter(character, value, true);
    }
  settleGcgDefeats(duel, standingBefore);
  for (const side of duel.sides) pruneGcgZoneCards(side);
  return dealt;
};

// Records a hit that lands on a standing character, with the reaction it triggered if it triggered one
const recordGcgHit = (
  dealt: GcgDealtDamage[],
  hit: GcgCharacterState,
  damageType: GcgDealtDamage["damageType"],
  reaction?: GcgReactionKind,
): void => {
  if (hit.hp > 0) dealt.push({ damageType, ...(reaction === undefined ? {} : { reaction }) });
};

// Whether each character on each side stands before a hit lands, so a settle can tell the characters it defeats
const listGcgStandingCharacters = (duel: GcgDuel): boolean[][] =>
  duel.sides.map((side) => side.characters.map((character) => character.hp > 0));
