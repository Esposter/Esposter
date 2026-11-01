import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { PYRO_SCORPION_ID } from "#src/services/gcg/cards/constants";
import { createDuel } from "#src/services/gcg/cards/createDuel.test";
import { pyroScorpion } from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeGcgScriptedAction } from "#src/services/gcg/takeGcgScriptedAction";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createSideState = (characters: GcgCharacterState[], dice: Element[] = []): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  deckCardIds: [],
  dice,
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
describe(takeGcgScriptedAction, () => {
  const EREMITE_ID = 2303;
  const HYDRO_ID = 2101;

  test("should use its active character's Technique when no card is in hand and no skill is listed", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { element: Element.Pyro, id: EREMITE_ID },
      equipments: [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)],
    });
    const attacker = createSideState([eremite], [Element.Pyro, Element.Pyro]);
    const defender = createSideState([
      createGcgCharacterState({ character: { element: Element.Hydro, id: HYDRO_ID } }),
    ]);
    const duel = createDuel([attacker, defender]);

    const result = takeGcgScriptedAction(duel, 0);

    expect({ defenderHp: takeOne(defender.characters, 0).hp, result }).toStrictEqual({
      defenderHp: 8,
      result: GcgActionResult.Done,
    });
  });
});
