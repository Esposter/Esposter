import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { CROWFEATHER_COVER_ID, crowfeatherCover } from "#src/services/gcg/cards/crowfeatherCover";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgPreparedSkills } from "#src/services/gcg/runGcgPreparedSkills";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

const createDuel = (attacker: GcgSideState, defender: GcgSideState): GcgDuel => ({
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

const createCharacterState = (): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 1002,
    element: Element.Electro,
    hp: 10,
    id: 1,
    maxEnergy: 3,
    nameTextId: 1001,
    skills: [],
    weapon: "",
  },
  energy: 0,
  equipments: [],
  hp: 10,
  isFrozen: false,
  shield: 0,
  statuses: [],
});

// A prepared Elemental Skill that deals 3 Electro DMG, as the Rock-Paper-Scissors Combo's Paper does
const PREPARED_SKILL: GcgSkill = {
  costs: [],
  effect: "Effect_Damage_Elec_3",
  energyGain: 0,
  id: 24_016,
  kind: GcgSkillKind.ElementalSkill,
};

describe(runGcgPreparedSkills, () => {
  test("should spend a usage of the Crowfeather Cover its holder's prepared Elemental Skill benefits from", () => {
    expect.hasAssertions();

    const holder = createCharacterState();
    const cover = createGcgZoneCard(CROWFEATHER_COVER_ID, crowfeatherCover);
    holder.statuses = [cover];
    const attacker = createSideState(holder);
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const defender = createSideState(createCharacterState());
    const duel = createDuel(attacker, defender);

    runGcgPreparedSkills(duel, 0);

    expect({ coverUsages: cover.usages, defenderHp: takeOne(defender.characters, 0)?.hp }).toStrictEqual({
      coverUsages: 1,
      defenderHp: 6,
    });
  });

  test("should record a prepared skill as used this round, as a skill its character uses is", () => {
    expect.hasAssertions();

    const attacker = createSideState(createCharacterState());
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const duel = createDuel(attacker, createSideState(createCharacterState()));

    runGcgPreparedSkills(duel, 0);

    expect(attacker.usedSkillIds).toStrictEqual([PREPARED_SKILL.id]);
  });
});
