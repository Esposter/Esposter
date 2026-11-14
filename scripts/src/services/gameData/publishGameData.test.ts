import type { GameDataPublishResult } from "#src/models/gameData/GameDataPublishResult";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";
import type { GameDataLock } from "genshin-world";

import { GameDataPublishOutcome } from "#src/models/gameData/GameDataPublishOutcome";
import { createMemoryR2BucketClient } from "#src/services/cloudflare/createMemoryR2BucketClient.test";
import { DAY_MS } from "#src/services/gameData/constants";
import { formatGameDataLock } from "#src/services/gameData/formatGameDataLock";
import { getGameDataObjectKey } from "#src/services/gameData/getGameDataObjectKey";
import { planGameDataPublication } from "#src/services/gameData/planGameDataPublication";
import { publishGameData } from "#src/services/gameData/publishGameData";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { GameDataset } from "genshin-world";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Each environment's bucket is its own in-memory store, made fresh for each test, so a rerun reads what the test stored
const createBucketClientMap = () => ({
  [CloudflareEnvironment.Development]: createMemoryR2BucketClient(),
  [CloudflareEnvironment.Production]: createMemoryR2BucketClient(),
});

// The lock a published result plans, which a caller commits and a test carries into its next publish
const getPlannedLock = (result: GameDataPublishResult): GameDataLock => {
  if (result.outcome !== GameDataPublishOutcome.Published)
    throw new InvalidOperationError(Operation.Read, result.outcome, "is not a published publication");
  return result.plannedLock;
};

describe(publishGameData, () => {
  const emptyLock: GameDataLock = { indexes: {}, objects: {} };
  // One object, and an index of two entries: four stored objects in all
  const publication: GameDataPublication = {
    indexes: { "profile/English": { "10000002": { name: "a" }, "10000003": { name: "b" } } },
    objects: { "stats/weapons": [1, 2] },
  };
  const scopes = [GameDataset.Profile, GameDataset.Stats];

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test("stores each object once per environment and plans the lock it names", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const result = await publishGameData({
      createBucketClientMap: () => bucketClientMap,
      currentLock: emptyLock,
      publication,
      scopes,
    });

    const plannedLock = getPlannedLock(result);
    expect(Object.keys(plannedLock.objects)).toStrictEqual(["stats/weapons"]);
    expect(Object.keys(plannedLock.indexes)).toStrictEqual(["profile/English"]);
    expect(result).toStrictEqual({
      outcome: GameDataPublishOutcome.Published,
      plannedLock,
      storedObjectCount: 4,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 4, [CloudflareEnvironment.Production]: 4 },
    });
    expect(bucketClientMap[CloudflareEnvironment.Production].store.size).toBe(4);
  });

  test("stores nothing an environment already holds when the lock already names the publication", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = getPlannedLock(
      await publishGameData({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        publication,
        scopes,
      }),
    );
    const rerun = await publishGameData({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      publication,
      scopes,
    });

    expect(rerun).toStrictEqual({
      outcome: GameDataPublishOutcome.Published,
      plannedLock: currentLock,
      storedObjectCount: 4,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 0, [CloudflareEnvironment.Production]: 0 },
    });
    expect(bucketClientMap[CloudflareEnvironment.Development].store.size).toBe(4);
  });

  test("stores an object an environment lost although the lock still names it", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = getPlannedLock(
      await publishGameData({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        publication,
        scopes,
      }),
    );
    const record = takeOne(planGameDataPublication(publication).records);
    bucketClientMap[CloudflareEnvironment.Production].store.delete(getGameDataObjectKey(record.dataset, record.hash));

    const rerun = await publishGameData({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      publication,
      scopes,
    });

    expect(rerun).toStrictEqual({
      outcome: GameDataPublishOutcome.Published,
      plannedLock: currentLock,
      storedObjectCount: 4,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 0, [CloudflareEnvironment.Production]: 1 },
    });
    expect(bucketClientMap[CloudflareEnvironment.Production].store.size).toBe(4);
  });

  // A record that changes is one new object, and its index is the only other object a lock change needs
  test("stores a changed record and its index only", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = getPlannedLock(
      await publishGameData({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        publication,
        scopes,
      }),
    );
    const changedPublication: GameDataPublication = {
      ...publication,
      indexes: { "profile/English": { ...publication.indexes["profile/English"], "10000003": { name: "c" } } },
    };
    const result = await publishGameData({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      publication: changedPublication,
      scopes,
    });

    expect(result).toStrictEqual({
      outcome: GameDataPublishOutcome.Published,
      plannedLock: getPlannedLock(result),
      storedObjectCount: 4,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 2, [CloudflareEnvironment.Production]: 2 },
    });
  });

  // An object stored long ago and named by no lock is rewritten with its bytes, which restarts its age past any prune
  test("rewrites a stored object that is past the reuse window and that no lock names", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    await publishGameData({
      createBucketClientMap: () => bucketClientMap,
      currentLock: emptyLock,
      publication,
      scopes,
    });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(100 * DAY_MS));
    const result = await publishGameData({
      createBucketClientMap: () => bucketClientMap,
      currentLock: emptyLock,
      publication,
      scopes,
    });

    expect(result).toStrictEqual({
      outcome: GameDataPublishOutcome.Published,
      plannedLock: getPlannedLock(result),
      storedObjectCount: 4,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 4, [CloudflareEnvironment.Production]: 4 },
    });
  });

  // An index is hashed from its entries in id order, so the lock names the same index whatever order its records were
  // Built in. The ids here are not integers, which an object would otherwise keep in insertion order on its own
  test("names the same lock whatever order an index's entries were produced in", async () => {
    expect.hasAssertions();

    const ascending: GameDataPublication = {
      indexes: { "profile/English": { alpha: { name: "a" }, beta: { name: "b" } } },
      objects: {},
    };
    // Inserted beta first, which an object literal would not keep in its written order
    const descending: GameDataPublication = {
      indexes: {
        "profile/English": Object.fromEntries([
          ["beta", { name: "b" }],
          ["alpha", { name: "a" }],
        ]),
      },
      objects: {},
    };
    const first = getPlannedLock(
      await publishGameData({ createBucketClientMap, currentLock: emptyLock, publication: ascending, scopes }),
    );
    const second = getPlannedLock(
      await publishGameData({ createBucketClientMap, currentLock: emptyLock, publication: descending, scopes }),
    );

    expect(formatGameDataLock(second)).toBe(formatGameDataLock(first));
  });

  // A dry run is the build alone: it names what it would publish, and with no bucket factory it reads and writes none
  test("names what it would publish without touching a bucket", async () => {
    expect.hasAssertions();

    const result = await publishGameData({ currentLock: emptyLock, publication, scopes });

    // Nothing was published before, so the lock it would leave is the plan's own
    const plan = planGameDataPublication(publication);
    expect(result).toStrictEqual({
      nextLock: plan.lock,
      outcome: GameDataPublishOutcome.DryRun,
      records: plan.records,
      storedObjectCount: 4,
    });
  });

  // An empty publication that leaves the lock as it is stores and lists nothing, so it returns before any bucket is made,
  // And the credential that would make one is never read
  test("an empty publication makes no request and leaves the lock as it is", async () => {
    expect.hasAssertions();

    const createBucketClientMapSpy = vi.fn<typeof createBucketClientMap>(createBucketClientMap);
    const result = await publishGameData({
      createBucketClientMap: createBucketClientMapSpy,
      currentLock: emptyLock,
      publication: { indexes: {}, objects: {} },
      scopes,
    });

    expect(result).toStrictEqual({ outcome: GameDataPublishOutcome.Empty });
    expect(createBucketClientMapSpy).not.toHaveBeenCalled();
  });

  // The lock can change with no upload: a scope that names entries the lock holds drops them when nothing replaces them
  test("an empty publication that drops a scope's entries still publishes the lock", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = getPlannedLock(
      await publishGameData({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        publication,
        scopes,
      }),
    );
    const result = await publishGameData({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      publication: { indexes: {}, objects: {} },
      scopes,
    });

    expect(result).toStrictEqual({
      outcome: GameDataPublishOutcome.Published,
      plannedLock: emptyLock,
      storedObjectCount: 0,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 0, [CloudflareEnvironment.Production]: 0 },
    });
  });

  // A bucket that refuses a write must leave the lock where it was, which the caller only moves once this resolves
  test("rejects when a bucket refuses a write", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    vi.spyOn(bucketClientMap[CloudflareEnvironment.Production], "put").mockRejectedValue(new Error("offline"));

    await expect(
      publishGameData({ createBucketClientMap: () => bucketClientMap, currentLock: emptyLock, publication, scopes }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[AggregateError: offline]`);
  });

  test("rejects a record published outside the scopes it names", async () => {
    expect.hasAssertions();

    await expect(
      publishGameData({ currentLock: emptyLock, publication, scopes: [GameDataset.Profile] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: stats/weapons, is published outside the scopes it names]`,
    );
  });
});
