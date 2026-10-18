import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { applyGcgDamage, applyGcgStandbyPiercing } from "#src/services/gcg/applyGcgDamage";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { dealGcgSkillDamage } from "#src/services/gcg/dealGcgSkillDamage";
import { findGcgZoneCardOwner } from "#src/services/gcg/effects/findGcgZoneCardOwner";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { parseGcgDamageEffect } from "#src/services/gcg/effects/parseGcgDamageEffect";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { takeOne } from "@esposter/shared";

// Runs a skill's effect for its active character, without paying for it: a shared damage effect, or the character's own
// Script. Then the skill is recorded as used this round, the field's on-use hooks run, the cards on either side's field hear
// The use through their any-side hooks, and the active character's passives hear it. Returns false, with nothing run, when
// The skill's effect is one no module covers. The cards that hear the skill are those on each field when it is used, so a
// Card the skill creates hears the next skill
export const runGcgSkillUse = (baseContext: GcgEffectContext, skill: GcgSkill): boolean => {
  const side = takeOne(baseContext.duel.sides, baseContext.sideIndex);
  const user = side.characters.at(side.activeIndex);
  // A Normal Attack by a character switched in this round is a Plunging Attack. The first skill she uses spends the
  // Switch, so a later Normal Attack is no Plunging Attack
  const isPlunge = skill.kind === GcgSkillKind.NormalAttack && user?.isSwitchedIn === true;
  const context: GcgEffectContext = { ...baseContext, isPlunge, skill };
  const skillModule = GcgEffectNameSkillModuleMap.get(skill.effect);
  const damage = parseGcgDamageEffect(skill.effect) ?? skillModule?.getDamage?.(context);
  if (damage === undefined && !skillModule?.afterDamage) return false;
  if (user) user.isSwitchedIn = false;
  const fieldCards = listGcgFieldCards(side, side.activeIndex);
  const fieldOfEachSide = context.duel.sides.map((sideState) => ({
    sideState,
    zoneCards: listGcgFieldCards(sideState, undefined),
  }));
  const dealt: GcgDealtDamage[] = damage ? dealGcgSkillDamage(context, damage) : [];
  const standbyPiercing = skillModule?.getStandbyPiercing?.(context);
  if (standbyPiercing) dealt.push(...applyGcgStandbyPiercing(context.duel, context.sideIndex, standbyPiercing));
  skillModule?.afterDamage?.(context);
  side.usedSkillIds.push(skill.id);
  for (const zoneCard of fieldCards) {
    const characterIndex = findGcgZoneCardOwner(side.characters, zoneCard);
    const skillDamage = GcgCardIdModuleMap.get(zoneCard.cardId)?.onSkillUsed?.(
      { ...context, characterIndex },
      skill,
      zoneCard,
      dealt,
    );
    if (skillDamage) applyGcgDamage(context.duel, context.sideIndex, skillDamage, context.duel.rule);
  }
  for (const [sideIndex, { sideState, zoneCards }] of fieldOfEachSide.entries())
    for (const zoneCard of zoneCards)
      GcgCardIdModuleMap.get(zoneCard.cardId)?.onAnySkillUsed?.(
        { ...context, characterIndex: findGcgZoneCardOwner(sideState.characters, zoneCard), sideIndex },
        skill,
        zoneCard,
        dealt,
      );
  for (const passive of user?.character.skills ?? [])
    if (passive.kind === GcgSkillKind.Passive)
      GcgEffectNameSkillModuleMap.get(passive.effect)?.afterSkillUsed?.(context);
  for (const sideState of context.duel.sides) pruneGcgZoneCards(sideState);
  return true;
};
