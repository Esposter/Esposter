import { createMemoryR2BucketClient } from "#src/services/cloudflare/createMemoryR2BucketClient.test";
import { DAY_MS } from "#src/services/gameData/constants";
import { getGameDataObjectKey } from "#src/services/gameData/getGameDataObjectKey";
import { pruneGameData } from "#src/services/gameData/pruneGameData";
import { CHARACTER_PACKS_PREFIX } from "#src/services/genshinAssets/characterPacks/constants";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(pruneGameData, () => {
  const dataset = "stats/weapons";
  const liveHash = "a".repeat(64);
  const oldHash = "b".repeat(64);
  const youngHash = "c".repeat(64);
  const bucketClient = createMemoryR2BucketClient();

  // Each object is written at the instant the clock stands at, so the test moves the clock to age them
  const writeObject = (key: string) => bucketClient.put(key, Buffer.from("{}"));

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    bucketClient.store.clear();
  });

  test("deletes an object no live lock reaches and that is past retention, and keeps the rest", async () => {
    expect.hasAssertions();

    await writeObject(getGameDataObjectKey(dataset, liveHash));
    await writeObject(getGameDataObjectKey(dataset, oldHash));
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(99 * DAY_MS));
    await writeObject(getGameDataObjectKey(dataset, youngHash));
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(100 * DAY_MS));
    const result = await pruneGameData({
      bucketClient,
      isDryRun: false,
      liveObjects: [{ dataset, hash: liveHash }],
      now: 100 * DAY_MS,
    });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 1, keptCount: 0 });
    expect([...bucketClient.store.keys()].toSorted()).toStrictEqual(
      [getGameDataObjectKey(dataset, liveHash), getGameDataObjectKey(dataset, youngHash)].toSorted(),
    );
  });

  test("keeps an old object outside the game data datasets", async () => {
    expect.hasAssertions();

    const packKey = `${CHARACTER_PACKS_PREFIX}/10000006/model.pmx`;
    await writeObject(packKey);
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(100 * DAY_MS));
    const result = await pruneGameData({ bucketClient, isDryRun: false, liveObjects: [], now: 100 * DAY_MS });

    expect(result).toStrictEqual({ candidateCount: 0, deletedCount: 0, keptCount: 0 });
    expect([...bucketClient.store.keys()]).toStrictEqual([packKey]);
  });

  test("lists what it would delete without deleting it", async () => {
    expect.hasAssertions();

    await writeObject(getGameDataObjectKey(dataset, oldHash));
    const result = await pruneGameData({ bucketClient, isDryRun: true, liveObjects: [], now: 100 * DAY_MS });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 0, keptCount: 0 });
    expect(bucketClient.store.size).toBe(1);
  });
});
