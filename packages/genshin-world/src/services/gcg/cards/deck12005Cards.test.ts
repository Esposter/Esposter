import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { iceLotus } from "#src/services/gcg/cards/iceLotus";
import { jadeScreen } from "#src/services/gcg/cards/jadeScreen";
import { lightningStiletto } from "#src/services/gcg/cards/lightningStiletto";
import { sacredCryoPearl } from "#src/services/gcg/cards/sacredCryoPearl";
import { stellarRestoration } from "#src/services/gcg/cards/stellarRestoration";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const FULL_HP = 10;
const KEQING_ID = 1403;
const OTHER_CHARACTER_ID = 1401;
const OPPOSING_CHARACTER_ID = 1203;
const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const TALENT_SKILL: GcgSkill = {
  costs: [],
  effect: "Char_Skill_14032_Ex_1",
  energyGain: 1,
  id: 14_032,
  kind: GcgSkillKind.ElementalSkill,
};

const NORMAL_SKILL: GcgSkill = { ...TALENT_SKILL, effect: "Char_Skill_14032" };

const createCharacterState = (id: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Electro,
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
  round: 1,
  rule: TEST_RULE,
  sides,
  winnerSideIndex: undefined,
});

describe("sacred Cryo Pearl", () => {
  test("the end phase deals its piercing and Cryo, and spends a usage", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(111_011, sacredCryoPearl);
    const duel = createDuel([
      createSideState([createCharacterState(OTHER_CHARACTER_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID), createCharacterState(KEQING_ID)]),
    ]);
    duel.sides[0] = { ...takeOne(duel.sides, 0), summons: [zoneCard] };
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 1, FULL_HP - 1]);
    expect(zoneCard.usages).toBe(1);
  });
});

describe("ice Lotus", () => {
  test("the active character takes one less DMG, and the lotus is spent after two", () => {
    expect.hasAssertions();
    const context: GcgEffectContext = { duel: createDuel([createSideState([]), createSideState([])]), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(111_012, iceLotus);
    expect(iceLotus.modifyDamageReceived?.(context, 3, zoneCard)).toBe(2);
    expect(zoneCard.usages).toBe(1);
    expect(iceLotus.modifyDamageReceived?.(context, 3, zoneCard)).toBe(2);
    expect(zoneCard.usages).toBe(0);
  });
});

describe("jade Screen", () => {
  test("damage below 2 passes unchanged, and damage of 2 or more is cut by one", () => {
    expect.hasAssertions();
    const context: GcgEffectContext = { duel: createDuel([createSideState([]), createSideState([])]), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(116_011, jadeScreen);
    expect(jadeScreen.modifyDamageReceived?.(context, 1, zoneCard)).toBe(1);
    expect(zoneCard.usages).toBe(2);
    expect(jadeScreen.modifyDamageReceived?.(context, 2, zoneCard)).toBe(1);
    expect(zoneCard.usages).toBe(1);
  });
});

describe("stellar Restoration", () => {
  test("the skill deals 3 Electro and creates a Lightning Stiletto in hand", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(OTHER_CHARACTER_ID), createCharacterState(KEQING_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    takeOne(duel.sides, 0).activeIndex = 1;
    expect(stellarRestoration.getDamage?.({ duel, sideIndex: 0 })).toStrictEqual({
      damageType: Element.Electro,
      value: 3,
    });
    runGcgSkillUse({ duel, sideIndex: 0 }, NORMAL_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 3]);
    expect(takeOne(duel.sides, 0).hand).toStrictEqual([114_031]);
  });
});

describe("lightning Stiletto", () => {
  test("a played card switches Keqing in and uses her skill once, without another copy", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(OTHER_CHARACTER_ID), createCharacterState(KEQING_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    const context: GcgEffectContext = { duel, sideIndex: 0 };
    expect(lightningStiletto.canPlay?.(context, undefined)).toBe(true);
    lightningStiletto.play?.(context, undefined);
    expect(takeOne(duel.sides, 0).activeIndex).toBe(1);
    expect(lightningStiletto.skillOnPlay?.(context, undefined)).toStrictEqual(TALENT_SKILL);
    runGcgSkillUse(context, TALENT_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 3]);
    expect(takeOne(duel.sides, 0).hand).toStrictEqual([]);
  });
});
