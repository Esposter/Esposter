import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgOutcome } from "#src/models/gcg/GcgOutcome";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { describe, expect, test } from "vitest";

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
});
const createDuel = (sides: [GcgSideState, GcgSideState]): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  round: 1,
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
    character: { element, hp: FULL_HP, id: 1, maxEnergy: 3, skills: [] },
    energy: 0,
    hp: FULL_HP,
    isFrozen: false,
    shield: 0,
  });

  test("should consume a Cryo aura under a Pyro hit and add the Melt damage in its place", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel([
      createSideState([createCharacterState(Element.Pyro)]),
      createSideState([createCharacterState(Element.Cryo, Element.Cryo)]),
    ]);
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);

    expect({ aura: duel.sides[1].characters[0]?.aura, hp: duel.sides[1].characters[0]?.hp }).toStrictEqual({
      aura: GcgAura.None,
      hp: FULL_HP - PYRO_VALUE - 2,
    });
  });

  test("should apply a Pyro aura on a hit that reacts with nothing, and leave none for an Anemo hit", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel([
      createSideState([createCharacterState(Element.Pyro)]),
      createSideState([createCharacterState(Element.Hydro)]),
    ]);
    applyGcgDamage(duel, 0, { damageType: Element.Anemo, value: ELEMENT_VALUE }, rule);
    const auraAfterAnemo = duel.sides[1].characters[0]?.aura;
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);

    expect({ auraAfterAnemo, auraAfterPyro: duel.sides[1].characters[0]?.aura }).toStrictEqual({
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
    const frozenHp = duel.sides[1].characters[0]?.hp;
    const isFrozenAfterFreeze = duel.sides[1].characters[0]?.isFrozen;
    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: PYRO_VALUE }, rule);

    expect({
      frozenHp,
      hpAfterPyro: duel.sides[1].characters[0]?.hp,
      isFrozenAfterFreeze,
      isFrozenAfterPyro: duel.sides[1].characters[0]?.isFrozen,
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

    expect({ hp: target.hp, shieldAfterPiercing, shieldAfterPhysical: target.shield }).toStrictEqual({
      hp: FULL_HP - PYRO_VALUE - 1,
      shieldAfterPiercing: SHIELD_POINTS,
      shieldAfterPhysical: 0,
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

    expect({ activeIndex: duel.sides[1].activeIndex, hp: duel.sides[1].characters[0]?.hp }).toStrictEqual({
      activeIndex: 1,
      hp: FULL_HP - PYRO_VALUE - 2,
    });
  });

  test("should pierce the other opposing characters for one under Superconduct", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel([
      createSideState([createCharacterState(Element.Electro)]),
      createSideState([createCharacterState(Element.Cryo, Element.Cryo), createCharacterState(Element.Hydro)]),
    ]);
    applyGcgDamage(duel, 0, { damageType: Element.Electro, value: ELEMENT_VALUE }, rule);

    expect(duel.sides[1].characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - ELEMENT_VALUE - 1, FULL_HP - 1]);
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
    const isReplacementPending = duel.sides[1].isReplacementPending;
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
});
