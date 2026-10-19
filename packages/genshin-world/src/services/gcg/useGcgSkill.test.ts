import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { mintyMeatRolls } from "#src/services/gcg/cards/mintyMeatRolls";
import { MINTY_MEAT_ROLLS_ID, PYRO_SCORPION_ID, SWEEPING_TIME_ID } from "#src/services/gcg/cards/constants";
import { BURNING_ASSAULT_SKILL, pyroScorpion } from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { sweepingTime } from "#src/services/gcg/cards/sweepingTime";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

const createDuel = (attacker: GcgSideState, defender: GcgSideState): GcgDuel => ({
  cardModules: GcgCardIdModuleMap,
  skillModules: GcgEffectNameSkillModuleMap,
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: TEST_RULE,
  sides: [attacker, defender],
  winnerSideIndex: undefined,
});

const createSideState = (character: GcgCharacterState, dice: Element[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters: [character],
  dice,
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

const createPyroCharacter = (skills: GcgSkill[]) =>
  createGcgCharacterState({ character: { descriptionTextId: 1002, element: Element.Pyro, nameTextId: 1001, skills } });

describe(useGcgSkill, () => {
  const NORMAL_ATTACK_ID = 13_011;
  const BURST_ID = 13_013;
  const normalAttack: GcgSkill = {
    costs: [{ count: 1, element: Element.Pyro, kind: GcgCostKind.Dice }],
    effect: "Effect_Damage_Physic_1",
    energyGain: 1,
    id: NORMAL_ATTACK_ID,
    kind: GcgSkillKind.NormalAttack,
  };
  const burst: GcgSkill = {
    costs: [{ count: 2, kind: GcgCostKind.Energy }],
    effect: "Effect_Damage_Fire_3",
    energyGain: 0,
    id: BURST_ID,
    kind: GcgSkillKind.ElementalBurst,
  };

  test("should pay the skill's dice, gain its energy, and pass the turn to the other side", () => {
    expect.hasAssertions();

    const attacker = createSideState(createPyroCharacter([normalAttack]), [Element.Pyro, Element.Hydro]);
    const duel = createDuel(attacker, createSideState(createPyroCharacter([]), []));
    const result = useGcgSkill(duel, 0, NORMAL_ATTACK_ID, [0]);

    expect({
      actingSideIndex: duel.actingSideIndex,
      dice: attacker.dice,
      energy: takeOne(attacker.characters, 0)?.energy,
      result,
    }).toStrictEqual({ actingSideIndex: 1, dice: [Element.Hydro], energy: 1, result: GcgActionResult.Done });
  });

  test("should refuse a skill its active character cannot use while Frozen, leaving the duel as it was", () => {
    expect.hasAssertions();

    const character = createPyroCharacter([normalAttack]);
    character.isFrozen = true;
    const attacker = createSideState(character, [Element.Pyro]);
    const duel = createDuel(attacker, createSideState(createPyroCharacter([]), []));

    expect({ dice: attacker.dice, result: useGcgSkill(duel, 0, NORMAL_ATTACK_ID, [0]) }).toStrictEqual({
      dice: [Element.Pyro],
      result: GcgActionResult.Frozen,
    });
  });

  test("should refuse a burst its character has not the energy for", () => {
    expect.hasAssertions();

    const character = createPyroCharacter([burst]);
    character.energy = 1;
    const attacker = createSideState(character, []);
    const duel = createDuel(attacker, createSideState(createPyroCharacter([]), []));

    expect(useGcgSkill(duel, 0, BURST_ID, [])).toBe(GcgActionResult.Unpayable);
  });

  test("should leave a standby character's status out of its active character's Normal Attack cost", () => {
    expect.hasAssertions();

    const unalignedAttack: GcgSkill = { ...normalAttack, costs: [{ count: 1, kind: GcgCostKind.Unaligned }] };
    const active = createPyroCharacter([unalignedAttack]);
    const minty = createGcgZoneCard(MINTY_MEAT_ROLLS_ID, mintyMeatRolls);
    const standby = { ...createPyroCharacter([]), statuses: [minty] };
    const attacker = { ...createSideState(active, [Element.Pyro]), characters: [active, standby] };
    const duel = createDuel(attacker, createSideState(createPyroCharacter([]), []));
    const usagesBefore = minty.usages;

    const result = useGcgSkill(duel, 0, NORMAL_ATTACK_ID, [0]);

    expect({ dice: attacker.dice, mintyUsages: minty.usages, result }).toStrictEqual({
      dice: [],
      mintyUsages: usagesBefore,
      result: GcgActionResult.Done,
    });
  });

  test("should leave a standby character's Sweeping Time out of its active character's Geo Normal Attack cost", () => {
    expect.hasAssertions();

    const geoAttack: GcgSkill = {
      ...normalAttack,
      costs: [{ count: 1, element: Element.Geo, kind: GcgCostKind.Dice }],
    };
    const active = createPyroCharacter([geoAttack]);
    const sweeping = createGcgZoneCard(SWEEPING_TIME_ID, sweepingTime);
    const standby = { ...createPyroCharacter([]), statuses: [sweeping] };
    const attacker = { ...createSideState(active, [Element.Geo]), characters: [active, standby] };
    const duel = createDuel(attacker, createSideState(createPyroCharacter([]), []));

    const result = useGcgSkill(duel, 0, NORMAL_ATTACK_ID, [0]);

    expect({ dice: attacker.dice, result, usedCardIds: attacker.usedCardIds }).toStrictEqual({
      dice: [],
      result: GcgActionResult.Done,
      usedCardIds: [],
    });
  });

  test("should use the Technique its equipped card gives the character, paying its Matching dice", () => {
    expect.hasAssertions();

    const character = createPyroCharacter([]);
    character.equipments = [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)];
    const attacker = createSideState(character, [Element.Pyro, Element.Pyro]);
    const defender = createSideState(createPyroCharacter([]), []);
    const duel = createDuel(attacker, defender);

    const result = useGcgSkill(duel, 0, BURNING_ASSAULT_SKILL.id, [0, 1]);

    expect({
      defenderHp: takeOne(defender.characters, 0).hp,
      dice: attacker.dice,
      result,
      usedSkillIds: attacker.usedSkillIds,
    }).toStrictEqual({ defenderHp: 8, dice: [], result: GcgActionResult.Done, usedSkillIds: [] });
  });
});
