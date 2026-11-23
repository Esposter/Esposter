import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { HostedAssetLock } from "hosted-assets";

import { createGameDataLockObject } from "#src/services/gameData/createGameDataLockObject.test";
import { summarizeGameDataChanges } from "#src/services/gameData/summarizeGameDataChanges";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(summarizeGameDataChanges, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads a 404 for an object's published copy as no baseline, so its content reports as added rather than failing", async () => {
    expect.hasAssertions();

    // The bucket answers 404 for the old object, so there is nothing published to compare the new record against
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 404 }));
    const currentLock: HostedAssetLock = {
      indexes: {},
      objects: { "stats/weapons": createGameDataLockObject("stats/weapons", "1".repeat(64)) },
    };
    const nextLock: HostedAssetLock = {
      indexes: {},
      objects: { "stats/weapons": createGameDataLockObject("stats/weapons", "2".repeat(64)) },
    };
    const records: GameDataRecord[] = [
      { dataset: "stats/weapons", hash: "2".repeat(64), isIndex: false, json: '{"attack":1,"defense":2}' },
    ];

    const summary = await summarizeGameDataChanges(currentLock, nextLock, records);

    expect(summary).toStrictEqual([
      "  objects +0 -0 ~1, indexes +0 -0 ~0, index entries +0 -0 ~0",
      "  stats/weapons › (root) added ×1",
    ]);
  });
});
