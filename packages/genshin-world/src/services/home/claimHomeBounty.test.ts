import type { Character } from "#src/models/character/Character";
import type { HomeProgress } from "#src/models/home/HomeProgress";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { claimHomeBounty } from "#src/services/home/claimHomeBounty";
import { HOME_RATE_PERIOD_SECONDS } from "#src/services/home/constants";
import { describe, expect, test } from "vitest";

describe(claimHomeBounty, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const FIRST_CHARACTER_ID = 1;
  const SECOND_CHARACTER_ID = 2;
  const RATE = 4;
  const LIMIT = 10;
  const COMFORT = 0;
  const TOP_EXP = 30;
  const character: Character = {
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
  const progress: HomeProgress = {
    accruedAt: EPOCH,
    companionIds: [FIRST_CHARACTER_ID, SECOND_CHARACTER_ID],
    learnedBlueprintIds: [],
    madeBlueprintIds: [],
    orders: [],
    realmBounty: 0,
    realmCurrency: 0,
    trustExp: 0,
  };
  const options = {
    comfort: COMFORT,
    comfortLevels: [{ bountyRate: RATE, coinRate: 0, comfort: COMFORT, level: 1 }],
    friendshipLevels: [
      { exp: 0, level: 1 },
      { exp: TOP_EXP, level: 2 },
    ],
    trustLevels: [{ bountyStoreLimit: LIMIT, coinStoreLimit: 0, exp: 0, level: 1, npcCount: 2 }],
  };

  test("a companion living in the realm earns Companionship EXP", () => {
    expect.hasAssertions();

    const now = EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS });
    const characters = [character, { ...character, id: SECOND_CHARACTER_ID }];

    const result = claimHomeBounty(characters, progress, now, options);

    expect(result.characters).toStrictEqual([
      { ...character, friendshipExp: RATE },
      { ...character, friendshipExp: RATE, id: SECOND_CHARACTER_ID },
    ]);
    expect(result.progress).toStrictEqual({ ...progress, accruedAt: now, realmBounty: 0 });
  });
});
