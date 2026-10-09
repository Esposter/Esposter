import type { Character } from "#src/models/character/Character";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

describe(gainCompanionshipExp, () => {
  const FIRST_CHARACTER_ID = 1;
  const SECOND_CHARACTER_ID = 2;
  const BENCHED_CHARACTER_ID = 3;
  const GAIN_EXP = 5;
  const TOP_EXP = 30;
  const FRIENDSHIP_LEVELS: FriendshipLevel[] = [
    { exp: 0, level: 1 },
    { exp: 10, level: 2 },
    { exp: TOP_EXP, level: 3 },
  ];
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    friendshipExp: 0,
    id: FIRST_CHARACTER_ID,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };

  test("should give the whole EXP to each deployed character but the Traveler, and none to a benched one", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID, FIRST_CHARACTER_ID, SECOND_CHARACTER_ID]);
    party.teams[1] = { characterIds: [BENCHED_CHARACTER_ID], name: "" };
    const characters = [
      { ...CHARACTER, id: TRAVELER_CHARACTER_ID },
      { ...CHARACTER, id: FIRST_CHARACTER_ID },
      { ...CHARACTER, id: SECOND_CHARACTER_ID },
      { ...CHARACTER, id: BENCHED_CHARACTER_ID },
    ];

    expect(gainCompanionshipExp(characters, party, GAIN_EXP, FRIENDSHIP_LEVELS)).toStrictEqual([
      { ...CHARACTER, id: TRAVELER_CHARACTER_ID },
      { ...CHARACTER, friendshipExp: GAIN_EXP, id: FIRST_CHARACTER_ID },
      { ...CHARACTER, friendshipExp: GAIN_EXP, id: SECOND_CHARACTER_ID },
      { ...CHARACTER, id: BENCHED_CHARACTER_ID },
    ]);
  });

  test("should stop each character at the top level's EXP, and leave one already there at it", () => {
    expect.hasAssertions();

    const party = createParty([FIRST_CHARACTER_ID, SECOND_CHARACTER_ID]);
    const characters = [
      { ...CHARACTER, friendshipExp: TOP_EXP - 2 },
      { ...CHARACTER, friendshipExp: TOP_EXP, id: SECOND_CHARACTER_ID },
    ];

    expect(gainCompanionshipExp(characters, party, GAIN_EXP, FRIENDSHIP_LEVELS)).toStrictEqual([
      { ...CHARACTER, friendshipExp: TOP_EXP },
      { ...CHARACTER, friendshipExp: TOP_EXP, id: SECOND_CHARACTER_ID },
    ]);
  });
});
