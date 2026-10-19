import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { passGcgTurn } from "#src/services/gcg/passGcgTurn";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
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

describe(passGcgTurn, () => {
  // A prepared Elemental Skill that deals 3 Electro DMG, as the Rock-Paper-Scissors Combo's Paper does
  const PREPARED_SKILL: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Elec_3",
    energyGain: 0,
    id: 24_016,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("should keep a side's prepared skill for its next turn while the opponent has declared its end", () => {
    expect.hasAssertions();

    const attacker = createSideState(
      createGcgCharacterState({ character: { descriptionTextId: 1002, element: Element.Electro, nameTextId: 1001 } }),
      [],
    );
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const defender = createSideState(
      createGcgCharacterState({ character: { descriptionTextId: 1002, element: Element.Electro, nameTextId: 1001 } }),
      [],
    );
    defender.hasDeclaredEnd = true;
    const duel = createDuel(attacker, defender);

    passGcgTurn(duel, 0);

    expect({
      actingSideIndex: duel.actingSideIndex,
      defenderHp: takeOne(defender.characters, 0)?.hp,
      prepared: attacker.preparedSkills.length,
    }).toStrictEqual({ actingSideIndex: 0, defenderHp: 10, prepared: 1 });
  });

  test("should run a side's prepared skill as the turn passes to it", () => {
    expect.hasAssertions();

    const attacker = createSideState(
      createGcgCharacterState({ character: { descriptionTextId: 1002, element: Element.Electro, nameTextId: 1001 } }),
      [],
    );
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const defender = createSideState(
      createGcgCharacterState({ character: { descriptionTextId: 1002, element: Element.Electro, nameTextId: 1001 } }),
      [],
    );
    const duel = createDuel(attacker, defender);
    duel.actingSideIndex = 1;

    passGcgTurn(duel, 1);

    expect({
      actingSideIndex: duel.actingSideIndex,
      defenderHp: takeOne(defender.characters, 0)?.hp,
      prepared: attacker.preparedSkills.length,
    }).toStrictEqual({ actingSideIndex: 0, defenderHp: 7, prepared: 0 });
  });
});
