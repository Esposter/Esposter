import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { cuileinAnbar } from "#src/services/gcg/cards/cuileinAnbar";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const FULL_HP = 10;
const COLLEI_ID = 1701;
const OPPOSING_CHARACTER_ID = 1203;
const CUILEIN_ANBAR_ID = 117_011;
const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const TRUMP_CARD_KITTY_SKILL: GcgSkill = {
  costs: [],
  effect: "Char_Skill_17013",
  energyGain: 0,
  id: 17_013,
  kind: GcgSkillKind.ElementalBurst,
};

const FLORAL_BRUSH_SKILL: GcgSkill = {
  costs: [],
  effect: "Char_Skill_17012",
  energyGain: 1,
  id: 17_012,
  kind: GcgSkillKind.ElementalSkill,
};

const createCharacterState = (id: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Dendro,
    hp: FULL_HP,
    id,
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

describe("cuilein-Anbar", () => {
  test("the end phase deals 2 Dendro to the opposing active character, and spends a usage", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(CUILEIN_ANBAR_ID, cuileinAnbar);
    const duel = createDuel([
      createSideState([createCharacterState(COLLEI_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID), createCharacterState(COLLEI_ID)]),
    ]);
    duel.sides[0] = { ...takeOne(duel.sides, 0), summons: [zoneCard] };
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 2, FULL_HP]);
    expect(zoneCard.usages).toBe(1);
  });
});

describe("floral Brush", () => {
  test("the skill deals 3 Dendro", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(COLLEI_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 3]);
  });
});

describe("trump-Card Kitty", () => {
  test("the burst deals 2 Dendro, and summons a Cuilein-Anbar on its side", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(COLLEI_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, TRUMP_CARD_KITTY_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 2]);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([CUILEIN_ANBAR_ID]);
  });
});
