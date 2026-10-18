import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";

import { computeTrounceBlossomInteractables } from "#src/services/bosses/computeTrounceBlossomInteractables";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeTrounceBlossomInteractables, () => {
  const place = { x: 3, z: 4 };
  const GROUND_HEIGHT = 5;
  const gameText = { [GameTextKey.TrounceBlossom]: "Test Blossom" };
  const getGroundHeight = () => GROUND_HEIGHT;
  const SPAWN_KEY = "camp-1|member-1";

  test("a defeated normal boss's blossom is claimable at its place until it is claimed", () => {
    expect.hasAssertions();

    const unclaimed: TrounceBlossom = { place, uniqueDropId: 1 };
    const claimedAt = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");

    expect(
      computeTrounceBlossomInteractables(new Map([[SPAWN_KEY, unclaimed]]), gameText, getGroundHeight),
    ).toStrictEqual([
      { id: SPAWN_KEY, kind: InteractionKind.Claim, name: "Test Blossom", position: { x: 3, y: GROUND_HEIGHT, z: 4 } },
    ]);
    expect(
      computeTrounceBlossomInteractables(
        new Map([[SPAWN_KEY, { ...unclaimed, claimedAt }]]),
        gameText,
        getGroundHeight,
      ),
    ).toStrictEqual([]);
  });
});
