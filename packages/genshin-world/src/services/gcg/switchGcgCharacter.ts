import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { checkGcgActingSide } from "#src/services/gcg/checkGcgActingSide";
import { GCG_SWITCH_DICE_COUNT } from "#src/services/gcg/constants";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { passGcgTurn } from "#src/services/gcg/passGcgTurn";
import { payGcgSubjectCost } from "#src/services/gcg/payGcgSubjectCost";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { takeOne } from "@esposter/shared";

// A combat action: the side pays one die of any face, fewer where the field reduces the switch, to make a standing
// Character on standby its active one, and the turn passes. A switch the field makes fast passes no turn. Each card on the
// Field then hears the switch, and the damage it deals after it is dealt. Refused for the active character itself, a
// Character who is down, or dice that cannot be paid
export const switchGcgCharacter = (
  duel: GcgDuel,
  sideIndex: number,
  characterIndex: number,
  paidDiceIndices: number[],
): GcgActionResult => {
  const refusal = checkGcgActingSide(duel, sideIndex);
  if (refusal !== undefined) return refusal;
  const side = takeOne(duel.sides, sideIndex);
  const next = side.characters.at(characterIndex);
  const active = side.characters.at(side.activeIndex);
  if (!next || next.hp <= 0 || characterIndex === side.activeIndex || !active) return GcgActionResult.Unavailable;
  if (
    !payGcgSubjectCost(
      { duel, sideIndex },
      side.activeIndex,
      { card: undefined, skill: undefined },
      [{ count: GCG_SWITCH_DICE_COUNT, kind: GcgCostKind.Unaligned }],
      paidDiceIndices,
    )
  )
    return GcgActionResult.Unpayable;
  const isFast =
    active.character.skills.some(
      ({ effect, kind }) =>
        kind === GcgSkillKind.Passive &&
        GcgEffectNameSkillModuleMap.get(effect)?.isSwitchFast?.({ duel, sideIndex }) === true,
    ) ||
    listGcgFieldCards(side, undefined).some(
      (zoneCard) => GcgCardIdModuleMap.get(zoneCard.cardId)?.isSwitchFast?.({ duel, sideIndex }) === true,
    );
  side.activeIndex = characterIndex;
  for (const zoneCard of listGcgFieldCards(side, undefined)) {
    const damage = GcgCardIdModuleMap.get(zoneCard.cardId)?.onSwitch?.({ duel, sideIndex }, zoneCard);
    if (damage) applyGcgDamage(duel, sideIndex, damage, duel.rule);
  }
  for (const sideState of duel.sides) pruneGcgZoneCards(sideState);
  if (!isFast) passGcgTurn(duel, sideIndex);
  return GcgActionResult.Done;
};
