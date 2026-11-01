import type { Element } from "#src/models/Element";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { createDuel } from "#src/services/gcg/cards/createDuel.test";
import { ELECTRO_CHARACTER, PREPARED_SKILL } from "#src/services/gcg/constants.test";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { passGcgTurn } from "#src/services/gcg/passGcgTurn";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createSideState = (character: GcgCharacterState, dice: Element[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters: [character],
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

describe(passGcgTurn, () => {
  test("should keep a side's prepared skill for its next turn while the opponent has declared its end", () => {
    expect.hasAssertions();

    const attacker = createSideState(createGcgCharacterState({ character: ELECTRO_CHARACTER }), []);
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const defender = createSideState(createGcgCharacterState({ character: ELECTRO_CHARACTER }), []);
    defender.hasDeclaredEnd = true;
    const duel = createDuel([attacker, defender]);

    passGcgTurn(duel, 0);

    expect({
      actingSideIndex: duel.actingSideIndex,
      defenderHp: takeOne(defender.characters, 0)?.hp,
      prepared: attacker.preparedSkills.length,
    }).toStrictEqual({ actingSideIndex: 0, defenderHp: 10, prepared: 1 });
  });

  test("should run a side's prepared skill as the turn passes to it", () => {
    expect.hasAssertions();

    const attacker = createSideState(createGcgCharacterState({ character: ELECTRO_CHARACTER }), []);
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const defender = createSideState(createGcgCharacterState({ character: ELECTRO_CHARACTER }), []);
    const duel = createDuel([attacker, defender]);
    duel.actingSideIndex = 1;

    passGcgTurn(duel, 1);

    expect({
      actingSideIndex: duel.actingSideIndex,
      defenderHp: takeOne(defender.characters, 0)?.hp,
      prepared: attacker.preparedSkills.length,
    }).toStrictEqual({ actingSideIndex: 0, defenderHp: 7, prepared: 0 });
  });
});
