import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { crowfeatherCover } from "#src/services/gcg/cards/crowfeatherCover";
import { CROWFEATHER_COVER_ID } from "#src/services/gcg/cards/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgPreparedSkills } from "#src/services/gcg/runGcgPreparedSkills";
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

const createSideState = (character: GcgCharacterState): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters: [character],
  dice: [],
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

describe(runGcgPreparedSkills, () => {
  // A prepared Elemental Skill that deals 3 Electro DMG, as the Rock-Paper-Scissors Combo's Paper does
  const PREPARED_SKILL: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Elec_3",
    energyGain: 0,
    id: 24_016,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("should spend a usage of the Crowfeather Cover its holder's prepared Elemental Skill benefits from", () => {
    expect.hasAssertions();

    const holder = createGcgCharacterState({
      character: { descriptionTextId: 1002, element: Element.Electro, nameTextId: 1001 },
    });
    const cover = createGcgZoneCard(CROWFEATHER_COVER_ID, crowfeatherCover);
    holder.statuses = [cover];
    const attacker = createSideState(holder);
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const defender = createSideState(
      createGcgCharacterState({ character: { descriptionTextId: 1002, element: Element.Electro, nameTextId: 1001 } }),
    );
    const duel = createDuel(attacker, defender);

    runGcgPreparedSkills(duel, 0);

    expect({ coverUsages: cover.usages, defenderHp: takeOne(defender.characters, 0)?.hp }).toStrictEqual({
      coverUsages: 1,
      defenderHp: 6,
    });
  });

  test("should record a prepared skill as used this round, as a skill its character uses is", () => {
    expect.hasAssertions();

    const attacker = createSideState(
      createGcgCharacterState({ character: { descriptionTextId: 1002, element: Element.Electro, nameTextId: 1001 } }),
    );
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const duel = createDuel(
      attacker,
      createSideState(
        createGcgCharacterState({ character: { descriptionTextId: 1002, element: Element.Electro, nameTextId: 1001 } }),
      ),
    );

    runGcgPreparedSkills(duel, 0);

    expect(attacker.usedSkillIds).toStrictEqual([PREPARED_SKILL.id]);
  });
});
