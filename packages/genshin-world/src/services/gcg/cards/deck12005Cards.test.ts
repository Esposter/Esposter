import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { electroInfusion } from "#src/services/gcg/cards/electroInfusion";
import { iceLotus } from "#src/services/gcg/cards/iceLotus";
import { icicle } from "#src/services/gcg/cards/icicle";
import { jadeScreen } from "#src/services/gcg/cards/jadeScreen";
import { sacredCryoPearl } from "#src/services/gcg/cards/sacredCryoPearl";
import { stellarRestoration } from "#src/services/gcg/cards/stellarRestoration";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
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
  random: () => 0,
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

describe("electro Infusion", () => {
  test("converts the Physical DMG its character deals to Electro, and lasts two rounds", () => {
    expect.hasAssertions();
    const context: GcgEffectContext = { duel: createDuel([createSideState([]), createSideState([])]), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(114_032, electroInfusion);
    expect(zoneCard.rounds).toBe(2);
    expect(
      electroInfusion.modifyDamageDealt?.(context, { damageType: GcgDamageKind.Physical, value: 2 }, zoneCard),
    ).toStrictEqual({ damageType: Element.Electro, value: 2 });
    expect(
      electroInfusion.modifyDamageDealt?.(context, { damageType: Element.Pyro, value: 2 }, zoneCard),
    ).toStrictEqual({ damageType: Element.Pyro, value: 2 });
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

  test("a Lightning Stiletto in hand is discarded, with every copy, and Keqing gains Electro Infusion in its place", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(OTHER_CHARACTER_ID), createCharacterState(KEQING_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    const side = takeOne(duel.sides, 0);
    side.activeIndex = 1;
    side.hand.push(114_031, 114_031);
    runGcgSkillUse({ duel, sideIndex: 0 }, NORMAL_SKILL);
    expect({
      hand: side.hand,
      keqingStatuses: takeOne(side.characters, 1).statuses.map(({ cardId }) => cardId),
    }).toStrictEqual({ hand: [], keqingStatuses: [114_032] });
  });
});

describe("lightning Stiletto", () => {
  test("a played card switches Keqing in for free, so the field's switch hook fires, and her skill grants Electro Infusion", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(OTHER_CHARACTER_ID), createCharacterState(KEQING_ID)]),
      createSideState([createCharacterState(OPPOSING_CHARACTER_ID)]),
    ]);
    const side = takeOne(duel.sides, 0);
    const icicleZoneCard = createGcgZoneCard(111_031, icicle);
    const card: GcgCard = {
      costs: [],
      descriptionTextId: 2,
      effects: [],
      id: 114_031,
      isLocation: false,
      kind: GcgCardKind.Event,
      nameTextId: 1,
    };
    side.cards.push(card);
    side.hand.push(card.id);
    side.onstages.push(icicleZoneCard);
    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect({
      activeIndex: side.activeIndex,
      hand: side.hand,
      icicleUsages: icicleZoneCard.usages,
      keqingStatuses: takeOne(side.characters, 1).statuses.map(({ cardId }) => cardId),
    }).toStrictEqual({ activeIndex: 1, hand: [], icicleUsages: 2, keqingStatuses: [114_032] });
  });
});
