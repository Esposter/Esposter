import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { sacrificialBow } from "#src/services/gcg/cards/sacrificialBow";
import { sacrificialGreatsword } from "#src/services/gcg/cards/sacrificialGreatsword";
import { sacrificialSword } from "#src/services/gcg/cards/sacrificialSword";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

// Plays a weapon on a character of the element, deals a hit, then uses an elemental skill twice in one round
const useWeapon = (module: GcgCardModule, cardId: number, element: Element) => {
  const ELEMENTAL_SKILL: GcgSkill = {
    costs: [],
    effect: "Made_Up_Skill",
    energyGain: 0,
    id: 1,
    kind: GcgSkillKind.ElementalSkill,
  };
  const side: GcgSideState = {
    activeIndex: 0,
    cards: [],
    characters: [createGcgCharacterState({ character: { element } })],
    deckCardIds: [],
    dice: [],
    drawPile: [],
    hand: [],
    hasDeclaredEnd: false,
    hasPrepared: true,
    hasRolled: true,
    isReplacementPending: false,
    onstages: [],
    summons: [],
    supports: [],
    usedCardIds: [],
    usedSkillIds: [],
  };
  const duel: GcgDuel = {
    actingSideIndex: 0,
    cardModules: GcgCardIdModuleMap,
    firstSideIndex: 0,
    nextFirstSideIndex: 0,
    outcome: undefined,
    phase: GcgPhase.Action,
    random: () => 0,
    round: 1,
    rule: TEST_RULE,
    sides: [side, side],
    skillModules: GcgEffectNameSkillModuleMap,
    winnerSideIndex: undefined,
  };
  const context: GcgEffectContext = { duel, sideIndex: 0 };
  const zoneCard = createGcgZoneCard(cardId, module);
  const damage = module.modifyDamageDealt?.(context, { damageType: Element.Pyro, value: 2 }, zoneCard);
  module.onSkillUsed?.(context, ELEMENTAL_SKILL, zoneCard, []);
  module.onSkillUsed?.(context, ELEMENTAL_SKILL, zoneCard, []);
  return { damage, dice: takeOne(duel.sides, 0).dice, usedCardIds: takeOne(duel.sides, 0).usedCardIds };
};

describe("the sacrificial weapons", () => {
  test.each([
    { cardId: 311_302, element: Element.Electro, module: sacrificialGreatsword, name: "sacrificialGreatsword" },
    { cardId: 311_502, element: Element.Hydro, module: sacrificialSword, name: "sacrificialSword" },
    { cardId: 311_202, element: Element.Cryo, module: sacrificialBow, name: "sacrificialBow" },
  ])(
    "$name deals +1 DMG, and a die of its element is made once per round after an elemental skill",
    ({ cardId, element, module }) => {
      expect.hasAssertions();
      expect(useWeapon(module, cardId, element)).toStrictEqual({
        damage: { damageType: Element.Pyro, value: 3 },
        dice: [element],
        usedCardIds: [cardId],
      });
    },
  );
});
