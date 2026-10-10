import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GCG_CATALYZING_FIELD_ID, GCG_DENDRO_CORE_ID } from "#src/services/gcg/constants";
import { dealGcgSkillDamage } from "#src/services/gcg/dealGcgSkillDamage";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

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

describe(dealGcgSkillDamage, () => {
  const FULL_HP = 10;
  const PYRO_VALUE = 2;

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
    equipments: [],
    hp: FULL_HP,
    isFrozen: false,
    shield: 0,
    statuses: [],
  });

  test("should add Dendro Core's two to the next Pyro skill damage and spend its usage", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
    const attacker = createSideState([createCharacterState(Element.Pyro)]);
    attacker.onstages.push({ cardId: GCG_DENDRO_CORE_ID, counter: 0, rounds: 0, usages: 1 });
    const duel: GcgDuel = {
      actingSideIndex: 0,
      firstSideIndex: 0,
      nextFirstSideIndex: 0,
      outcome: undefined,
      phase: GcgPhase.Action,
      round: 1,
      rule,
      sides: [attacker, createSideState([createCharacterState(Element.Hydro)])],
      winnerSideIndex: undefined,
    };
    dealGcgSkillDamage({ duel, sideIndex: 0 }, { damageType: Element.Pyro, value: PYRO_VALUE });

    expect({
      hpAfterFirst: takeOne(takeOne(duel.sides, 1).characters, 0)?.hp,
      usagesAfterFirst: attacker.onstages.map(({ usages }) => usages),
    }).toStrictEqual({ hpAfterFirst: FULL_HP - PYRO_VALUE - 2, usagesAfterFirst: [] });
  });

  test("should add Catalyzing Field's one to Dendro damage, and leave Pyro damage alone", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
    const attacker = createSideState([createCharacterState(Element.Dendro)]);
    attacker.onstages.push({ cardId: GCG_CATALYZING_FIELD_ID, counter: 0, rounds: 0, usages: 2 });
    const duel: GcgDuel = {
      actingSideIndex: 0,
      firstSideIndex: 0,
      nextFirstSideIndex: 0,
      outcome: undefined,
      phase: GcgPhase.Action,
      round: 1,
      rule,
      sides: [attacker, createSideState([createCharacterState(Element.Hydro)])],
      winnerSideIndex: undefined,
    };
    dealGcgSkillDamage({ duel, sideIndex: 0 }, { damageType: Element.Pyro, value: PYRO_VALUE });
    const usagesAfterPyro = attacker.onstages.map(({ usages }) => usages);
    takeOne(takeOne(duel.sides, 1).characters, 0).aura = GcgAura.None;
    dealGcgSkillDamage({ duel, sideIndex: 0 }, { damageType: Element.Dendro, value: PYRO_VALUE });

    expect({
      hpAfterDendro: takeOne(takeOne(duel.sides, 1).characters, 0)?.hp,
      usagesAfterDendro: attacker.onstages.map(({ usages }) => usages),
      usagesAfterPyro,
    }).toStrictEqual({
      hpAfterDendro: FULL_HP - PYRO_VALUE - 1 - PYRO_VALUE,
      usagesAfterDendro: [1],
      usagesAfterPyro: [2],
    });
  });
});
