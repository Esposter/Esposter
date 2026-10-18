import type { NormalBossTrounceBlossom } from "#src/models/bosses/TrounceBlossom";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { computeTrounceBlossomInteractables } from "#src/services/bosses/computeTrounceBlossomInteractables";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeTrounceBlossomInteractables, () => {
  const place = { x: 3, z: 4 };
  const GROUND_HEIGHT = 5;
  const gameText = { [GameTextKey.TrounceBlossom]: "Test Blossom" };
  const getGroundHeight = () => GROUND_HEIGHT;
  const now = Temporal.Instant.fromEpochMilliseconds(0);
  const SPAWN_KEY = "camp-1|member-1";

  test("a defeated normal boss's blossom is claimable at its place until it is claimed", () => {
    expect.hasAssertions();

    const unclaimed: NormalBossTrounceBlossom = {
      claimedAts: [],
      kind: BlossomKind.NormalBoss,
      place,
      uniqueDropId: 1,
    };

    expect(
      computeTrounceBlossomInteractables(new Map([[SPAWN_KEY, unclaimed]]), gameText, getGroundHeight, now),
    ).toStrictEqual([
      { id: SPAWN_KEY, kind: InteractionKind.Claim, name: "Test Blossom", position: { x: 3, y: GROUND_HEIGHT, z: 4 } },
    ]);
    expect(
      computeTrounceBlossomInteractables(
        new Map([[SPAWN_KEY, { ...unclaimed, claimedAts: [now] }]]),
        gameText,
        getGroundHeight,
        now,
      ),
    ).toStrictEqual([]);
  });
});
