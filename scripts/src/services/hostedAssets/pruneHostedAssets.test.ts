import { createMemoryR2BucketClient } from "#src/services/cloudflare/createMemoryR2BucketClient.test";
import { CHARACTER_PACKS_PREFIX } from "#src/services/genshinAssets/characterPacks/constants";
import { DAY_MS } from "#src/services/hostedAssets/constants";
import { pruneHostedAssets } from "#src/services/hostedAssets/pruneHostedAssets";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { GameDataset } from "genshin-world/definitions";
import { getHostedAssetPath } from "hosted-assets";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(pruneHostedAssets, () => {
  const scope = "stats/weapons";
  const scopes = [GameDataset.Stats];
  const liveHash = "a".repeat(64);
  const oldHash = "b".repeat(64);
  const youngHash = "c".repeat(64);
  const bucketClient = createMemoryR2BucketClient();
  const toPath = (sha256: string) => getHostedAssetPath({ extension: ".json", scope, sha256 });

  // Each object is written at the instant the clock stands at, so the test moves the clock to age them
  const writeObject = (key: string) => bucketClient.put(key, Buffer.from(""));

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    bucketClient.store.clear();
  });

  test("deletes an object no live lock reaches and that is past retention, and keeps the rest", async () => {
    expect.hasAssertions();

    await writeObject(toPath(liveHash));
    await writeObject(toPath(oldHash));
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(99 * DAY_MS));
    await writeObject(toPath(youngHash));
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(100 * DAY_MS));
    const result = await pruneHostedAssets({
      bucketClient,
      isDryRun: false,
      liveObjects: [{ extension: ".json", scope, sha256: liveHash }],
      now: 100 * DAY_MS,
      scopes,
    });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 1, keptCount: 0 });
    expect([...bucketClient.store.keys()].toSorted()).toStrictEqual([toPath(liveHash), toPath(youngHash)].toSorted());
  });

  test("keeps an old object outside the product's scopes", async () => {
    expect.hasAssertions();

    const packKey = `${CHARACTER_PACKS_PREFIX}/${TEST_FILENAME}`;
    await writeObject(packKey);
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(100 * DAY_MS));
    const result = await pruneHostedAssets({
      bucketClient,
      isDryRun: false,
      liveObjects: [],
      now: 100 * DAY_MS,
      scopes,
    });

    expect(result).toStrictEqual({ candidateCount: 0, deletedCount: 0, keptCount: 0 });
    expect([...bucketClient.store.keys()]).toStrictEqual([packKey]);
  });

  test("lists what it would delete without deleting it", async () => {
    expect.hasAssertions();

    await writeObject(toPath(oldHash));
    const result = await pruneHostedAssets({
      bucketClient,
      isDryRun: true,
      liveObjects: [],
      now: 100 * DAY_MS,
      scopes,
    });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 0, keptCount: 0 });
    expect(bucketClient.store.size).toBe(1);
  });
});
