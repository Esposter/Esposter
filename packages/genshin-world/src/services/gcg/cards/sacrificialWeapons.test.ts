import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { sacrificialBow } from "#src/services/gcg/cards/sacrificialBow";
import { sacrificialGreatsword } from "#src/services/gcg/cards/sacrificialGreatsword";
import { sacrificialSword } from "#src/services/gcg/cards/sacrificialSword";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const FULL_HP = 10;
const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const ELEMENTAL_SKILL: GcgSkill = {
  costs: [],
  effect: "Made_Up_Skill",
  energyGain: 0,
  id: 1,
  kind: GcgSkillKind.ElementalSkill,
};

// Plays a weapon on a character of the element, deals a hit, then uses an elemental skill twice in one round
const useWeapon = (module: GcgCardModule, cardId: number, element: Element) => {
  const side: GcgSideState = {
    activeIndex: 0,
    cards: [],
    characters: [
      {
        aura: GcgAura.None,
        character: {
          descriptionTextId: 2,
          element,
          hp: FULL_HP,
          id: 1,
          maxEnergy: 3,
          nameTextId: 1,
          skills: [],
          weapon: "",
        },
        energy: 0,
        equipments: [],
        hp: FULL_HP,
        isFrozen: false,
        shield: 0,
        statuses: [],
      },
    ],
    dice: [],
    deckCardIds: [],
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
    firstSideIndex: 0,
    nextFirstSideIndex: 0,
    outcome: undefined,
    phase: GcgPhase.Action,
    random: () => 0,
    round: 1,
    rule: TEST_RULE,
    sides: [side, side],
    winnerSideIndex: undefined,
  };
  const context: GcgEffectContext = { duel, sideIndex: 0 };
  const zoneCard = createGcgZoneCard(cardId, module);
  const damage = module.modifyDamageDealt?.(context, { damageType: Element.Pyro, value: 2 }, zoneCard);
  module.onSkillUsed?.(context, ELEMENTAL_SKILL, zoneCard, []);
  module.onSkillUsed?.(context, ELEMENTAL_SKILL, zoneCard, []);
  return { damage, dice: takeOne(duel.sides, 0).dice, usedCardIds: takeOne(duel.sides, 0).usedCardIds };
};

describe("sacrificial Greatsword", () => {
  test("the character deals +1 DMG, and a die of its element is made once per round after an elemental skill", () => {
    expect.hasAssertions();
    expect(useWeapon(sacrificialGreatsword, 311_302, Element.Electro)).toStrictEqual({
      damage: { damageType: Element.Pyro, value: 3 },
      dice: [Element.Electro],
      usedCardIds: [311_302],
    });
  });
});

describe("sacrificial Sword", () => {
  test("the character deals +1 DMG, and a die of its element is made once per round after an elemental skill", () => {
    expect.hasAssertions();
    expect(useWeapon(sacrificialSword, 311_502, Element.Hydro)).toStrictEqual({
      damage: { damageType: Element.Pyro, value: 3 },
      dice: [Element.Hydro],
      usedCardIds: [311_502],
    });
  });
});

describe("sacrificial Bow", () => {
  test("the character deals +1 DMG, and a die of its element is made once per round after an elemental skill", () => {
    expect.hasAssertions();
    expect(useWeapon(sacrificialBow, 311_202, Element.Cryo)).toStrictEqual({
      damage: { damageType: Element.Pyro, value: 3 },
      dice: [Element.Cryo],
      usedCardIds: [311_202],
    });
  });
});
