import { Element } from "#src/models/Element";
import { GCG_BURNING_FLAME_ID } from "#src/services/gcg/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { createDuel } from "#src/services/gcg/cards/createDuel.test";
import { createSideState } from "#src/services/gcg/cards/createSideState.test";

describe(runGcgEndPhase, () => {
  const FULL_HP = 10;

  test("should deal Burning Flame's one Pyro at the end phase, then take the summon off once its usage is spent", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { element: Element.Pyro } })]);
    attacker.summons.push({ cardId: GCG_BURNING_FLAME_ID, counter: 0, rounds: 0, usages: 1 });
    const duel = createDuel([
      attacker,
      createSideState([createGcgCharacterState({ character: { element: Element.Hydro } })]),
    ]);
    runGcgEndPhase(duel);

    expect({ hp: takeOne(takeOne(duel.sides, 1).characters, 0)?.hp, summons: attacker.summons }).toStrictEqual({
      hp: FULL_HP - 1,
      summons: [],
    });
  });
});
