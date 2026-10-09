import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgOutcome } from "#src/models/gcg/GcgOutcome";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { GCG_BURNING_FLAME_ID, GCG_DENDRO_CORE_ID } from "#src/services/gcg/constants";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { describe, expect, test } from "vitest";
import { takeOne } from "@esposter/shared";

import standardRule from "#src/generated/gcg/standardRule.json";
import { gcgStandardRuleSchema } from "#src/models/gcg/gcgStandardRuleSchema";

const TEST_RULE = gcgStandardRuleSchema.parse(standardRule);

const createSideState = (characters: GcgCharacterState[]): GcgSideState => ({
  activeIndex: 0,
  characters,
  dice: [],
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

describe(applyGcgDamage, () => {
  const FULL_HP = 10;
  const PYRO_VALUE = 1;
  const ELEMENT_VALUE = 1;
  const SHIELD_POINTS = 2;

  const createCharacterState = (element: Element, aura: Element | GcgAura = GcgAura.None): GcgCharacterState => ({
    aura,
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
    hp: FULL_HP,
    isFrozen: false,
    shield: 0,
    equipments: [],
    statuses: [],
  });

  test("should consume a Cryo aura under a Pyro hit and add the Melt damage in its place", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel([
      createSideState([createCharacterState(Element.Pyro)]),
      createSideState([createCharacterState(Element.Cryo, Element.Cryo)]),
    ]);
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);

    expect({
      aura: takeOne(takeOne(duel.sides, 1).characters, 0)?.aura,
      hp: takeOne(takeOne(duel.sides, 1).characters, 0)?.hp,
    }).toStrictEqual({ aura: GcgAura.None, hp: FULL_HP - PYRO_VALUE - 2 });
  });

  test("should apply a Pyro aura on a hit that reacts with nothing, and leave none for an Anemo hit", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel([
      createSideState([createCharacterState(Element.Pyro)]),
      createSideState([createCharacterState(Element.Hydro)]),
    ]);
    applyGcgDamage(duel, 0, { damageType: Element.Anemo, value: ELEMENT_VALUE }, rule);
    const auraAfterAnemo = takeOne(takeOne(duel.sides, 1).characters, 0)?.aura;
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);

    expect({ auraAfterAnemo, auraAfterPyro: takeOne(takeOne(duel.sides, 1).characters, 0)?.aura }).toStrictEqual({
      auraAfterAnemo: GcgAura.None,
      auraAfterPyro: Element.Pyro,
    });
  });

  test("should freeze a target hit by Cryo on Hydro, and break the freeze with a Pyro hit for two more", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel([
      createSideState([createCharacterState(Element.Cryo)]),
      createSideState([createCharacterState(Element.Hydro, Element.Hydro)]),
    ]);
    applyGcgDamage(duel, 0, { damageType: Element.Cryo, value: ELEMENT_VALUE }, rule);
    const frozenHp = takeOne(takeOne(duel.sides, 1).characters, 0)?.hp;
    const isFrozenAfterFreeze = takeOne(takeOne(duel.sides, 1).characters, 0)?.isFrozen;
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);

    expect({
      frozenHp,
      hpAfterPyro: takeOne(takeOne(duel.sides, 1).characters, 0)?.hp,
      isFrozenAfterFreeze,
      isFrozenAfterPyro: takeOne(takeOne(duel.sides, 1).characters, 0)?.isFrozen,
    }).toStrictEqual({
      frozenHp: FULL_HP - ELEMENT_VALUE - 1,
      hpAfterPyro: FULL_HP - ELEMENT_VALUE - 1 - PYRO_VALUE - 2,
      isFrozenAfterFreeze: true,
      isFrozenAfterPyro: false,
    });
  });

  test("should let a shield absorb a hit before HP, and leave piercing damage to pass it", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const target = createCharacterState(Element.Hydro);
    target.shield = SHIELD_POINTS;
    const duel = createDuel([createSideState([createCharacterState(Element.Pyro)]), createSideState([target])]);
    applyGcgDamage(duel, 0, { damageType: GcgDamageKind.Piercing, value: PYRO_VALUE }, rule);
    const shieldAfterPiercing = target.shield;
    applyGcgDamage(duel, 0, { damageType: GcgDamageKind.Physical, value: SHIELD_POINTS + 1 }, rule);

    expect({ hp: target.hp, shieldAfterPhysical: target.shield, shieldAfterPiercing }).toStrictEqual({
      hp: FULL_HP - PYRO_VALUE - 1,
      shieldAfterPhysical: 0,
      shieldAfterPiercing: SHIELD_POINTS,
    });
  });

  test("should switch an Overloaded active character forward to the next standing one", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel([
      createSideState([createCharacterState(Element.Pyro)]),
      createSideState([createCharacterState(Element.Electro, Element.Electro), createCharacterState(Element.Hydro)]),
    ]);
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);

    expect({
      activeIndex: takeOne(duel.sides, 1).activeIndex,
      hp: takeOne(takeOne(duel.sides, 1).characters, 0)?.hp,
    }).toStrictEqual({ activeIndex: 1, hp: FULL_HP - PYRO_VALUE - 2 });
  });

  test("should pierce the other opposing characters for one under Superconduct", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel([
      createSideState([createCharacterState(Element.Electro)]),
      createSideState([createCharacterState(Element.Cryo, Element.Cryo), createCharacterState(Element.Hydro)]),
    ]);
    applyGcgDamage(duel, 0, { damageType: Element.Electro, value: ELEMENT_VALUE }, rule);

    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([
      FULL_HP - ELEMENT_VALUE - 1,
      FULL_HP - 1,
    ]);
  });

  test("should grant the attacker's active character a shield point under Crystallize, at most the limit", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const attacker = createCharacterState(Element.Geo);
    const target = createCharacterState(Element.Pyro);
    const duel = createDuel([createSideState([attacker]), createSideState([target])]);
    for (let hit = 0; hit < 3; hit++) {
      target.aura = Element.Pyro;
      applyGcgDamage(duel, 0, { damageType: Element.Geo, value: ELEMENT_VALUE }, rule);
    }

    expect(attacker.shield).toBe(SHIELD_POINTS);
  });

  test("should owe a replacement for a defeated active character while one stands, and end the duel once none does", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const defeated = createCharacterState(Element.Hydro);
    defeated.hp = ELEMENT_VALUE;
    const standing = createCharacterState(Element.Cryo);
    const duel = createDuel([
      createSideState([createCharacterState(Element.Pyro)]),
      createSideState([defeated, standing]),
    ]);
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);
    const isReplacementPending = takeOne(duel.sides, 1).isReplacementPending;
    const phaseWithStanding = duel.phase;
    standing.hp = 0;
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);

    expect({
      isReplacementPending,
      outcome: duel.outcome,
      phase: duel.phase,
      phaseWithStanding,
      winnerSideIndex: duel.winnerSideIndex,
    }).toStrictEqual({
      isReplacementPending: true,
      outcome: GcgOutcome.Victory,
      phase: GcgPhase.Ended,
      phaseWithStanding: GcgPhase.Action,
      winnerSideIndex: 0,
    });
  });

  test("should leave Burning Flame as a summon on the attacker's side, stacking to two usages", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const attacker = createSideState([createCharacterState(Element.Pyro)]);
    const duel = createDuel([attacker, createSideState([createCharacterState(Element.Hydro, Element.Dendro)])]);
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);
    const usagesAfterOne = attacker.summons.map(({ usages }) => usages);
    takeOne(takeOne(duel.sides, 1).characters, 0).aura = Element.Dendro;
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);
    takeOne(takeOne(duel.sides, 1).characters, 0).aura = Element.Dendro;
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);

    expect({
      cardIds: attacker.summons.map(({ cardId }) => cardId),
      usagesAfterOne,
      usagesAfterStacks: attacker.summons.map(({ usages }) => usages),
    }).toStrictEqual({ cardIds: [GCG_BURNING_FLAME_ID], usagesAfterOne: [1], usagesAfterStacks: [2] });
  });

  test("should leave Dendro Core onstage on the attacker's side when a Bloom reaction triggers", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const attacker = createSideState([createCharacterState(Element.Hydro)]);
    const duel = createDuel([attacker, createSideState([createCharacterState(Element.Dendro)])]);
    applyGcgDamage(duel, 0, { damageType: Element.Hydro, value: ELEMENT_VALUE }, rule);
    expect(attacker.onstages.map(({ cardId }) => cardId)).toStrictEqual([]);
    takeOne(takeOne(duel.sides, 1).characters, 0).aura = Element.Dendro;
    applyGcgDamage(duel, 0, { damageType: Element.Hydro, value: ELEMENT_VALUE }, rule);

    expect(attacker.onstages).toStrictEqual([{ cardId: GCG_DENDRO_CORE_ID, counter: 0, rounds: 0, usages: 1 }]);
  });
});
