import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { FROSTFLAKE_SEKI_NO_TO_ID, frostflakeSekiNoTo } from "#src/services/gcg/cards/frostflakeSekiNoTo";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

const createCharacterState = (id: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Cryo,
    hp: 10,
    id,
    maxEnergy: 3,
    nameTextId: 1,
    skills: [],
    weapon: "",
  },
  energy: 0,
  equipments: [],
  hp: 10,
  isFrozen: false,
  shield: 0,
  statuses: [],
});

const createSideState = (characters: GcgCharacterState[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
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
});

const createDuel = (sides: [GcgSideState, GcgSideState]): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: TEST_RULE,
  sides,
  winnerSideIndex: undefined,
});

describe("frostflake Seki no To", () => {
  test("it deals 2 Cryo DMG at each End Phase, for two usages", () => {
    expect.hasAssertions();
    const context = { duel: createDuel([createSideState([]), createSideState([])]), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(FROSTFLAKE_SEKI_NO_TO_ID, frostflakeSekiNoTo);
    expect(frostflakeSekiNoTo.onEndPhase?.(context, zoneCard)).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    expect(zoneCard.usages).toBe(1);
    expect(frostflakeSekiNoTo.onEndPhase?.(context, zoneCard)).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    expect(zoneCard.usages).toBe(0);
  });
});

describe("kamisato Art: Soumetsu", () => {
  const SOUMETSU: GcgSkill = {
    costs: [],
    effect: "Char_Skill_11053",
    energyGain: 0,
    id: 11_053,
    kind: GcgSkillKind.ElementalBurst,
  };

  test("it deals 4 Cryo DMG and summons a Frostflake Seki no To", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(1105)]),
      createSideState([createCharacterState(1202)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, SOUMETSU);

    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([6]);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([FROSTFLAKE_SEKI_NO_TO_ID]);
  });
});
