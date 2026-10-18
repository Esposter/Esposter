import type { NormalBossTrounceBlossom, WeeklyBossTrounceBlossom } from "#src/models/bosses/TrounceBlossom";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { checkIsTrounceBlossomClaimable } from "#src/services/bosses/checkIsTrounceBlossomClaimable";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(checkIsTrounceBlossomClaimable, () => {
  const place = { x: 1, z: 2 };
  const UNIQUE_DROP_ID = 9001;
  // The epoch is a Thursday, so the Monday that starts its week is four days on, at the server's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const weeklyReset = epoch.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });
  const now = weeklyReset.add({ hours: 24 * 2 });

  test("a normal boss's blossom is claimable only until it is claimed", () => {
    expect.hasAssertions();

    const blossom: NormalBossTrounceBlossom = {
      claimedAts: [],
      kind: BlossomKind.NormalBoss,
      place,
      uniqueDropId: UNIQUE_DROP_ID,
    };

    expect(checkIsTrounceBlossomClaimable(blossom, now)).toBe(true);
    expect(checkIsTrounceBlossomClaimable({ ...blossom, claimedAts: [now] }, now)).toBe(false);
  });

  test("a weekly boss's blossom is claimable again after the weekly reset", () => {
    expect.hasAssertions();

    const blossom: WeeklyBossTrounceBlossom = { claimedAts: [], kind: BlossomKind.WeeklyBoss, place };

    expect(checkIsTrounceBlossomClaimable({ ...blossom, claimedAts: [weeklyReset.add({ hours: 24 })] }, now)).toBe(
      false,
    );
    expect(
      checkIsTrounceBlossomClaimable({ ...blossom, claimedAts: [weeklyReset.subtract({ hours: 24 * 7 })] }, now),
    ).toBe(true);
  });
});
