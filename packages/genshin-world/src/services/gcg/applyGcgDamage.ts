import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgOutcome } from "#src/models/gcg/GcgOutcome";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import {
  GCG_AURA_ELEMENTS,
  GCG_FROZEN_BONUS,
  GCG_PIERCING_DAMAGE,
  GCG_SPREAD_DAMAGE,
  GcgReactionKindBonusMap,
} from "#src/services/gcg/constants";
import { createGcgActiveCharacterSwitch } from "#src/services/gcg/createGcgActiveCharacterSwitch";
import { applyGcgNonDamageReactionEffects } from "#src/services/gcg/effects/applyGcgNonDamageReactionEffects";
import { checkIsGcgElementImmune } from "#src/services/gcg/effects/checkIsGcgElementImmune";
import { findGcgPermanentAura } from "#src/services/gcg/effects/findGcgPermanentAura";
import { findGcgZoneCardOwner } from "#src/services/gcg/effects/findGcgZoneCardOwner";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { modifyGcgDamageDealt } from "#src/services/gcg/effects/modifyGcgDamageDealt";
import { getGcgReactionKind } from "#src/services/gcg/getGcgReactionKind";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { reduceGcgReceivedDamage } from "#src/services/gcg/reduceGcgReceivedDamage";
import { takeOne } from "@esposter/shared";

// One damage from the side at sourceSideIndex to the opposing active character. Its side's field bears on it first, every
// Damage it deals alike, then the element applies its aura or reacts with the aura there, a reaction's damage and effects
// Settle with it, and a defeated character is cleared, with a side that has none standing losing the duel, and a side whose
// Active fell with one standing owing a replacement. It returns each hit it landed on a standing character, with the
// Reaction that hit triggered
export const applyGcgDamage = (
  duel: GcgDuel,
  sourceSideIndex: number,
  damage: GcgDamage,
  rule: GcgRule,
  context: GcgEffectContext = { duel, sideIndex: sourceSideIndex },
): GcgDealtDamage[] => {
  const targetSideIndex = 1 - sourceSideIndex;
  const targetSide = takeOne(duel.sides, targetSideIndex);
  const standingBefore = listGcgStandingCharacters(duel);
  const dealt: GcgDealtDamage[] = [];
  const hit = targetSide.characters.at(targetSide.activeIndex);
  const shieldBefore = hit?.shield ?? 0;
  if (hit)
    hitGcgCharacter(
      duel,
      sourceSideIndex,
      hit,
      reduceGcgReceivedDamage(duel, targetSideIndex, modifyGcgDamageDealt(context, damage)),
      rule,
      dealt,
      context,
    );
  settleGcgDefeats(duel, standingBefore);
  if (hit && shieldBefore > 0 && hit.shield === 0) notifyGcgShieldDepleted(duel, targetSideIndex, hit, rule);
  for (const sideIndex of duel.sides.keys()) pruneGcgZoneCards(duel, sideIndex);
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
    hurtGcgCharacter(duel, 1 - sourceSideIndex, hit, damage.value, true);
  } else if (damage.damageType === GcgDamageKind.Physical) {
    recordGcgHit(dealt, hit, damage.damageType);
    hurtGcgCharacter(duel, 1 - sourceSideIndex, hit, damage.value + takeGcgFrozenBonus(hit, damage.damageType), false);
  } else if (!checkIsGcgElementImmune([...hit.equipments, ...hit.statuses], damage.damageType, duel.cardModules)) {
    applyGcgElementalDamage(duel, sourceSideIndex, hit, damage.damageType, damage.value, rule, dealt, context);
    const permanentAura = findGcgPermanentAura([...hit.equipments, ...hit.statuses], duel.cardModules);
    if (permanentAura !== undefined) hit.aura = permanentAura;
  }
};

// A character that took DMG and is still standing: its equipments and statuses hear it first, then its passive skills, each
// Told which character it is on
const notifyGcgDamageTaken = (
  duel: GcgDuel,
  sideIndex: number,
  characterIndex: number,
  character: GcgCharacterState,
): void => {
  const context: GcgEffectContext = { characterIndex, duel, sideIndex };
  for (const zoneCard of [...character.equipments, ...character.statuses])
    duel.cardModules.get(zoneCard.cardId)?.onDamageTaken?.(context, zoneCard);
  for (const skill of character.character.skills)
    if (skill.kind === GcgSkillKind.Passive)
      duel.skillModules.get(skill.effect)?.afterDamageTaken?.({ ...context, skill });
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
    hurtGcgCharacter(duel, 1 - sourceSideIndex, hit, damageValue, false);
    return;
  }
  recordGcgHit(dealt, hit, element, reaction);
  damageValue += GcgReactionKindBonusMap[reaction];
  hit.aura = GcgAura.None;
  hurtGcgCharacter(duel, 1 - sourceSideIndex, hit, damageValue, false);
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
  // The piercing or spread the reaction sends to the other opposing characters is one damage its side deals, so the
  // Modifiers bear on it once however many characters it reaches. It carries the skill, but not the Plunging Attack bonus,
  // Which is the skill's own hit's
  const eventContext: GcgEffectContext = { duel, sideIndex: sourceSideIndex, skill: context.skill };
  if (reaction === GcgReactionKind.Superconduct || reaction === GcgReactionKind.ElectroCharged) {
    if (otherTargets.length > 0) {
      const piercing = modifyGcgDamageDealt(eventContext, {
        damageType: GcgDamageKind.Piercing,
        value: GCG_PIERCING_DAMAGE,
      }).value;
      for (const other of otherTargets) {
        recordGcgHit(dealt, other, GcgDamageKind.Piercing);
        hurtGcgCharacter(duel, 1 - sourceSideIndex, other, piercing, true);
      }
    }
  } else if (reaction === GcgReactionKind.Swirl) {
    if (otherTargets.length > 0) {
      const spread = modifyGcgDamageDealt(eventContext, { damageType: aura, value: GCG_SPREAD_DAMAGE });
      for (const other of otherTargets) {
        recordGcgHit(dealt, other, spread.damageType);
        hurtGcgCharacter(
          duel,
          1 - sourceSideIndex,
          other,
          spread.value + takeGcgFrozenBonus(other, spread.damageType),
          false,
        );
      }
    }
    for (const zoneCard of listGcgFieldCards(sourceSide, undefined))
      duel.cardModules.get(zoneCard.cardId)?.onSwirl?.({ duel, sideIndex: sourceSideIndex }, zoneCard, aura);
  }
  applyGcgNonDamageReactionEffects(
    duel,
    sourceSideIndex,
    1 - sourceSideIndex,
    hit,
    reaction,
    createGcgActiveCharacterSwitch((...damageArguments) => {
      applyGcgDamage(...damageArguments);
    }),
  );
};

// A Frozen character takes more from a Pyro or Physical hit, which removes its Frozen status. Nothing else breaks it
const takeGcgFrozenBonus = (character: GcgCharacterState, damageType: Element | GcgDamageKind): number => {
  if (!character.isFrozen || (damageType !== Element.Pyro && damageType !== GcgDamageKind.Physical)) return 0;
  character.isFrozen = false;
  return GCG_FROZEN_BONUS;
};

// A hit takes its shield's points off first, unless it is piercing, and a character at no HP takes nothing more. A character
// Still standing that lost HP or shield to it hears that it took the DMG, from the side it is on
const hurtGcgCharacter = (
  duel: GcgDuel,
  sideIndex: number,
  character: GcgCharacterState,
  value: number,
  isPiercing: boolean,
): void => {
  if (character.hp <= 0) return;
  const hpBefore = character.hp;
  const shieldBefore = character.shield;
  let remainingValue = value;
  if (!isPiercing) {
    const absorbedValue = Math.min(character.shield, remainingValue);
    character.shield -= absorbedValue;
    remainingValue -= absorbedValue;
  }
  character.hp = Math.max(0, character.hp - remainingValue);
  if (character.hp > 0 && (character.hp < hpBefore || character.shield < shieldBefore))
    notifyGcgDamageTaken(duel, sideIndex, takeOne(duel.sides, sideIndex).characters.indexOf(character), character);
};

// Discards what each character at no HP held, asks a side for a replacement when its active fell and another stands, and
// Ends the duel for the other side once a side has none standing
const settleGcgDefeats = (duel: GcgDuel, standingBefore: boolean[][]): void => {
  const defeatedSideIndices: number[] = [];
  for (const [sideIndex, side] of duel.sides.entries()) {
    for (const [characterIndex, character] of side.characters.entries()) {
      if (character.hp > 0) continue;
      if (standingBefore[sideIndex]?.[characterIndex] && replaceGcgDefeat(duel, sideIndex, characterIndex)) continue;
      if (standingBefore[sideIndex]?.[characterIndex]) {
        side.hasDefeatedCharacter = true;
        defeatedSideIndices.push(sideIndex);
      }
      // A defeat discards the character's equipment and statuses with its aura, Energy, Frozen and shield, as the rules state
      // (Genius Invokation TCG/Rules, "Other Rules", the Defeated row)
      character.aura = GcgAura.None;
      character.energy = 0;
      character.equipments = [];
      character.isFrozen = false;
      character.shield = 0;
      character.statuses = [];
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

// Tells the cards attached to a character whose shield a hit has just depleted. Each may answer with piercing DMG, which every
// Opposing character takes, the active one and those on standby alike, from the side the character is on
const notifyGcgShieldDepleted = (
  duel: GcgDuel,
  sideIndex: number,
  character: GcgCharacterState,
  rule: GcgRule,
): void => {
  const characterIndex = takeOne(duel.sides, sideIndex).characters.indexOf(character);
  for (const zoneCard of [...character.equipments, ...character.statuses]) {
    const value = duel.cardModules
      .get(zoneCard.cardId)
      ?.onShieldDepleted?.({ characterIndex, duel, sideIndex }, zoneCard);
    if (!value) continue;
    applyGcgDamage(duel, sideIndex, { damageType: GcgDamageKind.Piercing, value }, rule, { duel, sideIndex });
    applyGcgStandbyPiercing(duel, sideIndex, value);
  }
};

// A card attached to a character that would be defeated may answer it, restoring the character to the HP the card names.
// Only the first card to answer takes it, and the cards then attached to the character hear the replacement
const replaceGcgDefeat = (duel: GcgDuel, sideIndex: number, characterIndex: number): boolean => {
  const character = takeOne(takeOne(duel.sides, sideIndex).characters, characterIndex);
  const context: GcgEffectContext = { characterIndex, duel, sideIndex };
  for (const zoneCard of [...character.equipments, ...character.statuses]) {
    const hp = duel.cardModules.get(zoneCard.cardId)?.replaceDefeat?.(context, zoneCard);
    if (hp === undefined) continue;
    character.hp = hp;
    for (const heard of [...character.equipments, ...character.statuses])
      duel.cardModules.get(heard.cardId)?.onDefeatReplaced?.(context, heard);
    return true;
  }
  return false;
};

// Tells the cards on a side's field that an opposing character was defeated, each with the index of the character it is
// Attached to
const notifyGcgOpposingDefeat = (duel: GcgDuel, sideIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  for (const zoneCard of listGcgFieldCards(side, undefined))
    duel.cardModules
      .get(zoneCard.cardId)
      ?.onOpposingDefeated?.(
        { characterIndex: findGcgZoneCardOwner(side.characters, zoneCard), duel, sideIndex },
        zoneCard,
      );
};

// A piercing hit on each opposing character on standby, which no shield stops, as a skill's after-effect or an End Phase
// Deals it past its target. Its side's field bears on it once, carrying the skill but not the Plunging Attack bonus. A
// Defeated character is cleared, as an active one's would be
export const applyGcgStandbyPiercing = (
  duel: GcgDuel,
  sourceSideIndex: number,
  value: number,
  skill?: GcgSkill,
): GcgDealtDamage[] => {
  const standingBefore = listGcgStandingCharacters(duel);
  const targetSide = takeOne(duel.sides, 1 - sourceSideIndex);
  const dealt: GcgDealtDamage[] = [];
  const standbyCharacters = targetSide.characters.filter(
    (character, index) => index !== targetSide.activeIndex && character.hp > 0,
  );
  if (standbyCharacters.length > 0) {
    const piercing = modifyGcgDamageDealt(
      { duel, sideIndex: sourceSideIndex, skill },
      { damageType: GcgDamageKind.Piercing, value },
    ).value;
    for (const character of standbyCharacters) {
      recordGcgHit(dealt, character, GcgDamageKind.Piercing);
      hurtGcgCharacter(duel, 1 - sourceSideIndex, character, piercing, true);
    }
  }
  settleGcgDefeats(duel, standingBefore);
  for (const sideIndex of duel.sides.keys()) pruneGcgZoneCards(duel, sideIndex);
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
