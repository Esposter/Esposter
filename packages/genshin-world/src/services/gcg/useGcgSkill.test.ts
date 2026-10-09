import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { describe, expect, test } from "vitest";
import { takeOne } from "@esposter/shared";

import standardRule from "#src/generated/gcg/standardRule.json";
import { gcgStandardRuleSchema } from "#src/models/gcg/gcgStandardRuleSchema";

const TEST_RULE = gcgStandardRuleSchema.parse(standardRule);

const createSideState = (character: GcgCharacterState, dice: Element[]): GcgSideState => ({
  activeIndex: 0,
  characters: [character],
  dice,
  drawPile: [],
  hand: [],
  hasDeclaredEnd: false,
  hasPrepared: true,
  hasRolled: true,
  isReplacementPending: false,
  cards: [],
  onstages: [],
  summons: [],
  supports: [],
  usedCardIds: [],
  usedSkillIds: [],
});

const createDuel = (attacker: GcgSideState, defender: GcgSideState): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  round: 1,
  rule: TEST_RULE,
  sides: [attacker, defender],
  winnerSideIndex: undefined,
});

describe(useGcgSkill, () => {
  const MAX_ENERGY = 3;
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
  const createCharacterState = (skills: GcgSkill[]): GcgCharacterState => ({
    aura: GcgAura.None,
    character: {
      descriptionTextId: 1002,
      element: Element.Pyro,
      hp: 10,
      id: 1,
      maxEnergy: MAX_ENERGY,
      nameTextId: 1001,
      skills,
      weapon: "",
    },
    energy: 0,
    hp: 10,
    isFrozen: false,
    shield: 0,
    equipments: [],
    statuses: [],
  });

  test("should pay the skill's dice, gain its energy, and pass the turn to the other side", () => {
    expect.hasAssertions();

    const attacker = createSideState(createCharacterState([normalAttack]), [Element.Pyro, Element.Hydro]);
    const duel = createDuel(attacker, createSideState(createCharacterState([]), []));
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

    const character = createCharacterState([normalAttack]);
    character.isFrozen = true;
    const attacker = createSideState(character, [Element.Pyro]);
    const duel = createDuel(attacker, createSideState(createCharacterState([]), []));

    expect({ dice: attacker.dice, result: useGcgSkill(duel, 0, NORMAL_ATTACK_ID, [0]) }).toStrictEqual({
      dice: [Element.Pyro],
      result: GcgActionResult.Frozen,
    });
  });

  test("should refuse a burst its character has not the energy for", () => {
    expect.hasAssertions();

    const character = createCharacterState([burst]);
    character.energy = 1;
    const attacker = createSideState(character, []);
    const duel = createDuel(attacker, createSideState(createCharacterState([]), []));

    expect(useGcgSkill(duel, 0, BURST_ID, [])).toBe(GcgActionResult.Unpayable);
  });
});
