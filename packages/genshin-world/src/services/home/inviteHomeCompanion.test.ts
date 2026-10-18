import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { inviteHomeCompanion } from "#src/services/home/inviteHomeCompanion";
import { describe, expect, test } from "vitest";

describe(inviteHomeCompanion, () => {
  const CHARACTER_ID = 10_000_001;
  const OTHER_CHARACTER_ID = 10_000_002;
  const UNOWNED_CHARACTER_ID = 10_000_003;
  const FIRST_RANK_EXP = 300;
  const levels: HomeTrustLevel[] = [
    { bountyStoreLimit: 0, coinStoreLimit: 0, exp: FIRST_RANK_EXP, level: 1, npcCount: 1 },
    { bountyStoreLimit: 0, coinStoreLimit: 0, exp: 0, level: 2, npcCount: 2 },
  ];
  const progress: HomeProgress = {
    accruedAt: Temporal.Instant.fromEpochMilliseconds(0),
    claimedRewardIds: [],
    companionIds: [],
    learnedBlueprintIds: [],
    madeBlueprintIds: [],
    orders: [],
    realmBounty: 0,
    realmCurrency: 0,
    trustExp: 0,
  };
  const ownedCharacterIds = [CHARACTER_ID, OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID];
  // A realm at Trust Rank two, which holds two companions, so a refusal is not for want of room
  const roomyProgress: HomeProgress = { ...progress, trustExp: FIRST_RANK_EXP };

  test("a companion is invited within the Trust Rank's count", () => {
    expect.hasAssertions();

    const result = inviteHomeCompanion(CHARACTER_ID, { levels, ownedCharacterIds, progress });

    expect(result).toStrictEqual({ ...progress, companionIds: [CHARACTER_ID] });
  });

  test("a second companion is refused at Trust Rank one", () => {
    expect.hasAssertions();

    const withOneCompanion = { ...progress, companionIds: [CHARACTER_ID] };

    expect(
      inviteHomeCompanion(OTHER_CHARACTER_ID, { levels, ownedCharacterIds, progress: withOneCompanion }),
    ).toBeUndefined();
  });

  test("the Traveler cannot be invited", () => {
    expect.hasAssertions();

    expect(
      inviteHomeCompanion(TRAVELER_CHARACTER_ID, { levels, ownedCharacterIds, progress: roomyProgress }),
    ).toBeUndefined();
  });

  test("a character already living in the realm cannot be invited again", () => {
    expect.hasAssertions();

    const withCompanion = { ...roomyProgress, companionIds: [CHARACTER_ID] };

    expect(inviteHomeCompanion(CHARACTER_ID, { levels, ownedCharacterIds, progress: withCompanion })).toBeUndefined();
  });

  test("a character the player does not own cannot be invited", () => {
    expect.hasAssertions();

    expect(
      inviteHomeCompanion(UNOWNED_CHARACTER_ID, { levels, ownedCharacterIds, progress: roomyProgress }),
    ).toBeUndefined();
  });
});
