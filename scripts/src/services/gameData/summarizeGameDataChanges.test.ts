import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { GameDataLock } from "genshin-world";

import { summarizeGameDataChanges } from "#src/services/gameData/summarizeGameDataChanges";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(summarizeGameDataChanges, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("counts an object whose published blob the dev account lacks as new, rather than failing to read it", async () => {
    expect.hasAssertions();

    // The account answers 404 for the old blob, so there is nothing published to compare the new record against
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 404 }));
    const currentLock: GameDataLock = { indexes: {}, objects: { "stats/weapons": "1".repeat(64) } };
    const nextLock: GameDataLock = { indexes: {}, objects: { "stats/weapons": "2".repeat(64) } };
    const records: GameDataRecord[] = [
      { dataset: "stats/weapons", hash: "2".repeat(64), isIndex: false, json: '{"attack":1,"defense":2}' },
    ];

    const summary = await summarizeGameDataChanges(currentLock, nextLock, records);

    expect(summary[0]).toBe("  objects +0 -0 ~1, indexes +0 -0 ~0, index entries +0 -0 ~0");
    expect(summary.slice(1)).toStrictEqual(["  stats/weapons › (root) added ×1"]);
  });
});
