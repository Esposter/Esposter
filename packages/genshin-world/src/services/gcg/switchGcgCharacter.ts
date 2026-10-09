import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { checkGcgActingSide } from "#src/services/gcg/checkGcgActingSide";
import { GCG_SWITCH_DICE_COUNT } from "#src/services/gcg/constants";
import { passGcgTurn } from "#src/services/gcg/passGcgTurn";
import { payGcgCost } from "#src/services/gcg/payGcgCost";
import { takeOne } from "@esposter/shared";

// A combat action: the side pays one die of its choice to make a standing character on standby its active one, and the
// Turn passes. Refused for the active character itself, a character who is down, or a die that cannot be paid
export const switchGcgCharacter = (
  duel: GcgDuel,
  sideIndex: number,
  characterIndex: number,
  paidDieIndex: number,
): GcgActionResult => {
  const refusal = checkGcgActingSide(duel, sideIndex);
  if (refusal !== undefined) return refusal;
  const side = takeOne(duel.sides, sideIndex);
  const next = side.characters.at(characterIndex);
  const active = side.characters.at(side.activeIndex);
  if (!next || next.hp <= 0 || characterIndex === side.activeIndex || !active) return GcgActionResult.Unavailable;
  if (
    !payGcgCost(
      side,
      active.character.element,
      [{ count: GCG_SWITCH_DICE_COUNT, kind: GcgCostKind.Unaligned }],
      [paidDieIndex],
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
  if (!isFast) passGcgTurn(duel, sideIndex);
  return GcgActionResult.Done;
};
