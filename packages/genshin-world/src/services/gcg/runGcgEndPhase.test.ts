import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GCG_BURNING_FLAME_ID } from "#src/services/gcg/constants";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const FULL_HP = 10;

const createCharacterState = (element: Element, aura: Element | GcgAura = GcgAura.None): GcgCharacterState => ({
  aura,
  character: { descriptionTextId: 2, element, hp: FULL_HP, id: 1, maxEnergy: 3, nameTextId: 1, skills: [], weapon: "" },
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

describe(runGcgEndPhase, () => {
  test("should deal Burning Flame's one Pyro at the end phase, then take the summon off once its usage is spent", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const attacker = createSideState([createCharacterState(Element.Pyro)]);
    attacker.summons.push({ cardId: GCG_BURNING_FLAME_ID, counter: 0, rounds: 0, usages: 1 });
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
    runGcgEndPhase(duel);

    expect({ hp: takeOne(takeOne(duel.sides, 1).characters, 0)?.hp, summons: attacker.summons }).toStrictEqual({
      hp: FULL_HP - 1,
      summons: [],
    });
  });
});
