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
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { ELECTRO_CRYSTAL_CORE_ID, electroCrystalCore } from "#src/services/gcg/cards/electroCrystalCore";
import { FIERY_REBIRTH_ID, fieryRebirth } from "#src/services/gcg/cards/fieryRebirth";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { passGcgTurn } from "#src/services/gcg/passGcgTurn";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgPreparedSkills } from "#src/services/gcg/runGcgPreparedSkills";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const ABYSS_LECTOR_ID = 2_302;
const ELECTRO_HYPOSTASIS_ID = 2_401;
const KUJOU_SARA_ID = 1_406;

const createCharacterState = (id: number, element: Element): GcgCharacterState => ({
  aura: GcgAura.None,
  character: { descriptionTextId: 2, element, hp: 10, id, maxEnergy: 3, nameTextId: 1, skills: [], weapon: "" },
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
const createSkill = (id: number, effect: string, kind: GcgSkillKind): GcgSkill => ({
  costs: [],
  effect,
  energyGain: 0,
  id,
  kind,
});
const ELEMENTAL_SKILL = createSkill(23_022, "Effect_Damage_Fire_3", GcgSkillKind.ElementalSkill);
const ROCK_PAPER_SCISSORS_COMBO = createSkill(24_012, "Char_Skill_24012", GcgSkillKind.ElementalSkill);

describe("fiery Rebirth", () => {
  test("a lethal hit restores the character to 4 HP, and a second lethal hit defeats it", () => {
    expect.hasAssertions();

    const lector = { ...createCharacterState(ABYSS_LECTOR_ID, Element.Pyro), hp: 3 };
    lector.statuses = [createGcgZoneCard(FIERY_REBIRTH_ID, fieryRebirth)];
    const duel = createDuel([
      createSideState([lector]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    applyGcgDamage(duel, 1, { damageType: Element.Pyro, value: 5 }, TEST_RULE);

    const restored = takeOne(duel.sides, 0).characters[0];
    expect(restored?.hp).toBe(4);
    expect(restored?.statuses).toStrictEqual([{ cardId: FIERY_REBIRTH_ID, counter: 1, rounds: 0, usages: 0 }]);

    applyGcgDamage(duel, 1, { damageType: Element.Pyro, value: 5 }, TEST_RULE);

    expect(takeOne(duel.sides, 0).characters[0]?.hp).toBeLessThanOrEqual(0);
  });

  test("once triggered, the character's skill damage is 1 higher", () => {
    expect.hasAssertions();

    const lector = createCharacterState(ABYSS_LECTOR_ID, Element.Pyro);
    lector.statuses = [{ cardId: FIERY_REBIRTH_ID, counter: 1, rounds: 0, usages: 0 }];
    const duel = createDuel([
      createSideState([lector]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: 3 }, TEST_RULE, {
      duel,
      sideIndex: 0,
      skill: ELEMENTAL_SKILL,
    });

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(6);
  });
});

describe("electro Crystal Core", () => {
  test("a lethal hit restores the character to 1 HP, and the core is spent", () => {
    expect.hasAssertions();

    const hypostasis = { ...createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro), hp: 2 };
    hypostasis.statuses = [createGcgZoneCard(ELECTRO_CRYSTAL_CORE_ID, electroCrystalCore)];
    const duel = createDuel([
      createSideState([hypostasis]),
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)]),
    ]);

    applyGcgDamage(duel, 1, { damageType: Element.Electro, value: 4 }, TEST_RULE);

    const restored = takeOne(duel.sides, 0).characters[0];
    expect(restored?.hp).toBe(1);
    expect(restored?.statuses).toStrictEqual([]);
  });
});

describe("rock-Paper-Scissors Combo", () => {
  test("the combo deals 2 Electro and prepares Scissors and Paper, which run at the side's next turn", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
      createSideState([{ ...createCharacterState(KUJOU_SARA_ID, Element.Electro), hp: 20 }]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, ROCK_PAPER_SCISSORS_COMBO);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(18);
    expect(takeOne(duel.sides, 0).preparedSkills?.map(({ skill }) => skill.id)).toStrictEqual([24_015, 24_016]);

    runGcgPreparedSkills(duel, 0);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(13);
    expect(takeOne(duel.sides, 0).preparedSkills?.map(({ skill }) => skill.id)).toStrictEqual([24_016]);
  });

  test("the prepared skills run when their side's next turn begins, not before", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
      createSideState([{ ...createCharacterState(KUJOU_SARA_ID, Element.Electro), hp: 20 }]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, ROCK_PAPER_SCISSORS_COMBO);
    passGcgTurn(duel, 0);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(18);

    passGcgTurn(duel, 1);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(13);
  });

  test("a prepared skill whose character is defeated does not run", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro),
        createCharacterState(KUJOU_SARA_ID, Element.Electro),
      ]),
      createSideState([{ ...createCharacterState(KUJOU_SARA_ID, Element.Electro), hp: 20 }]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, ROCK_PAPER_SCISSORS_COMBO);
    takeOne(takeOne(duel.sides, 0).characters, 0).hp = 0;
    runGcgPreparedSkills(duel, 0);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(18);
  });
});
