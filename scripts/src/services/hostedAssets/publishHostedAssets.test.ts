import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetPublication } from "#src/models/hostedAssets/HostedAssetPublication";
import type { HostedAssetPublishResult } from "#src/models/hostedAssets/HostedAssetPublishResult";
import type { HostedAssetLock } from "hosted-assets";

import { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";
import { createMemoryR2BucketClient } from "#src/services/cloudflare/createMemoryR2BucketClient.test";
import { DAY_MS } from "#src/services/hostedAssets/constants";
import { formatHostedAssetLock } from "#src/services/hostedAssets/formatHostedAssetLock";
import { planHostedAssetPublication } from "#src/services/hostedAssets/planHostedAssetPublication";
import { publishHostedAssets } from "#src/services/hostedAssets/publishHostedAssets";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { GameDataset } from "genshin-world";
import { getHostedAssetPath } from "hosted-assets";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Each environment's bucket is its own in-memory store, made fresh for each test, so a rerun reads what the test stored
const createBucketClientMap = () => ({
  [CloudflareEnvironment.Development]: createMemoryR2BucketClient(),
  [CloudflareEnvironment.Production]: createMemoryR2BucketClient(),
});

// The lock a published result plans, which a caller commits and a test carries into its next publish
const getPlannedLock = (result: HostedAssetPublishResult): HostedAssetLock => {
  if (result.outcome !== HostedAssetPublishOutcome.Published)
    throw new InvalidOperationError(Operation.Read, result.outcome, "is not a published publication");
  return result.plannedLock;
};

describe(publishHostedAssets, () => {
  const emptyLock: HostedAssetLock = { indexes: {}, objects: {} };
  // One object, and an index of two entries: four stored objects in all
  const publication: HostedAssetPublication = {
    indexes: { "profile/English": { "10000002": { name: "a" }, "10000003": { name: "b" } } },
    objects: { "stats/weapons": [1, 2] },
  };
  const scopes = [GameDataset.Profile, GameDataset.Stats];
  const product: HostedAssetProduct = {
    bucket: StorageBucket.PublicGenshinAssets,
    lockPath: TEST_FILENAME,
    lockRepositoryPath: TEST_FILENAME,
    scopes,
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test("a verified publish writes both environments", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const result = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock: emptyLock,
      product,
      publication,
      scopes,
    });

    const plannedLock = getPlannedLock(result);
    expect(Object.keys(plannedLock.objects)).toStrictEqual(["stats/weapons"]);
    expect(Object.keys(plannedLock.indexes)).toStrictEqual(["profile/English"]);
    expect(result).toStrictEqual({
      outcome: HostedAssetPublishOutcome.Published,
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
      await publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        product,
        publication,
        scopes,
      }),
    );
    const rerun = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      product,
      publication,
      scopes,
    });

    expect(rerun).toStrictEqual({
      outcome: HostedAssetPublishOutcome.Published,
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
      await publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        product,
        publication,
        scopes,
      }),
    );
    const record = takeOne(planHostedAssetPublication(publication).records);
    bucketClientMap[CloudflareEnvironment.Production].store.delete(getHostedAssetPath(record));

    const rerun = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      product,
      publication,
      scopes,
    });

    expect(rerun).toStrictEqual({
      outcome: HostedAssetPublishOutcome.Published,
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
      await publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        product,
        publication,
        scopes,
      }),
    );
    const changedPublication: HostedAssetPublication = {
      ...publication,
      indexes: { "profile/English": { ...publication.indexes["profile/English"], "10000003": { name: "c" } } },
    };
    const result = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      product,
      publication: changedPublication,
      scopes,
    });

    expect(result).toStrictEqual({
      outcome: HostedAssetPublishOutcome.Published,
      plannedLock: getPlannedLock(result),
      storedObjectCount: 4,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 2, [CloudflareEnvironment.Production]: 2 },
    });
  });

  // An object stored long ago and named by no lock is rewritten with its bytes, which restarts its age past any prune
  test("rewrites a stored object that is past the reuse window and that no lock names", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock: emptyLock,
      product,
      publication,
      scopes,
    });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(100 * DAY_MS));
    const result = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock: emptyLock,
      product,
      publication,
      scopes,
    });

    expect(result).toStrictEqual({
      outcome: HostedAssetPublishOutcome.Published,
      plannedLock: getPlannedLock(result),
      storedObjectCount: 4,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 4, [CloudflareEnvironment.Production]: 4 },
    });
  });

  // An index is hashed from its entries in id order, so the lock names the same index whatever order its records were
  // Built in. The ids here are not integers, which an object would otherwise keep in insertion order on its own
  test("names the same lock whatever order an index's entries were produced in", async () => {
    expect.hasAssertions();

    const ascending: HostedAssetPublication = {
      indexes: { "profile/English": { alpha: { name: "a" }, beta: { name: "b" } } },
      objects: {},
    };
    // Inserted beta first, which an object literal would not keep in its written order
    const descending: HostedAssetPublication = {
      indexes: {
        "profile/English": Object.fromEntries([
          ["beta", { name: "b" }],
          ["alpha", { name: "a" }],
        ]),
      },
      objects: {},
    };
    const first = getPlannedLock(
      await publishHostedAssets({
        createBucketClientMap,
        currentLock: emptyLock,
        product,
        publication: ascending,
        scopes,
      }),
    );
    const second = getPlannedLock(
      await publishHostedAssets({
        createBucketClientMap,
        currentLock: emptyLock,
        product,
        publication: descending,
        scopes,
      }),
    );

    expect(formatHostedAssetLock(second)).toBe(formatHostedAssetLock(first));
  });

  // A dry run is the build alone: it names what it would publish, and with no bucket factory it reads and writes none
  test("names what it would publish without touching a bucket", async () => {
    expect.hasAssertions();

    const result = await publishHostedAssets({ currentLock: emptyLock, product, publication, scopes });

    // Nothing was published before, so the lock it would leave is the plan's own
    const plan = planHostedAssetPublication(publication);
    expect(result).toStrictEqual({
      nextLock: plan.lock,
      outcome: HostedAssetPublishOutcome.DryRun,
      records: plan.records,
      storedObjectCount: 4,
    });
  });

  // An empty publication that leaves the lock as it is stores and lists nothing, so it returns before any bucket is made,
  // And the credential that would make one is never read
  test("an empty publication makes no request and leaves the lock as it is", async () => {
    expect.hasAssertions();

    const createBucketClientMapSpy = vi.fn<typeof createBucketClientMap>(createBucketClientMap);
    const result = await publishHostedAssets({
      createBucketClientMap: createBucketClientMapSpy,
      currentLock: emptyLock,
      product,
      publication: { indexes: {}, objects: {} },
      scopes,
    });

    expect(result).toStrictEqual({ outcome: HostedAssetPublishOutcome.Empty });
    expect(createBucketClientMapSpy).not.toHaveBeenCalled();
  });

  // The lock can change with no upload: a scope that names entries the lock holds drops them when nothing replaces them
  test("an empty publication that drops a scope's entries still publishes the lock", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = getPlannedLock(
      await publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        product,
        publication,
        scopes,
      }),
    );
    const result = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      product,
      publication: { indexes: {}, objects: {} },
      scopes,
    });

    expect(result).toStrictEqual({
      outcome: HostedAssetPublishOutcome.Published,
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
      publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        product,
        publication,
        scopes,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[AggregateError: offline]`);
  });

  test("rejects a record published outside the scopes it names", async () => {
    expect.hasAssertions();

    await expect(
      publishHostedAssets({ currentLock: emptyLock, product, publication, scopes: [GameDataset.Profile] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: stats/weapons, is published outside the scopes it names]`,
    );
  });
});
