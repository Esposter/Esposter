import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetPublication } from "#src/models/hostedAssets/HostedAssetPublication";
import type { HostedAssetPublishResult } from "#src/models/hostedAssets/HostedAssetPublishResult";
import type { HostedAssetLock } from "hosted-assets";

import { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";
import { createMemoryR2BucketClient } from "#src/services/cloudflare/createMemoryR2BucketClient.test";
import { DAY_MS } from "#src/services/hostedAssets/constants";
import { filesProductBase } from "#src/services/hostedAssets/constants.test";
import { formatHostedAssetLock } from "#src/services/hostedAssets/formatHostedAssetLock";
import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { planHostedAssetPublication } from "#src/services/hostedAssets/planHostedAssetPublication";
import { publishHostedAssets } from "#src/services/hostedAssets/publishHostedAssets";
import { readHostedAssetBytes } from "#src/services/hostedAssets/readHostedAssetBytes";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { getContentAddress } from "@esposter/shared-node/cache";
import { GameDataset } from "genshin-world";
import { getHostedAssetPath, HOSTED_ASSET_CONTENT_TYPES } from "hosted-assets";
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
  const PROFILE_KEY = "profile/English";
  const WEAPONS_KEY = "stats/weapons";
  // One object, and an index of two entries: four stored objects in all
  const publication: HostedAssetPublication = {
    indexes: { [PROFILE_KEY]: { "10000002": { name: "a" }, "10000003": { name: "b" } } },
    objects: { [WEAPONS_KEY]: [1, 2] },
  };
  // The publication with one more object, so a publish of it changes the lock and lists the buckets
  const publicationWithShields: HostedAssetPublication = {
    ...publication,
    objects: { ...publication.objects, "stats/shields": [3] },
  };
  // The bytes a stored object is altered to, which no hash of its name matches
  const alteredBytes = Buffer.from(" ");
  const scopes = [GameDataset.Profile, GameDataset.Stats];
  const product: HostedAssetProduct = {
    bucket: StorageBucket.PublicGenshinAssets,
    lockPath: TEST_FILENAME,
    lockRepositoryPath: TEST_FILENAME,
    name: TEST_FILENAME,
    scopes,
    source: { kind: "records" },
  };
  // Publishes the base publication into a bucket map from no lock, and returns the lock it planned
  const publishPublication = async (
    bucketClientMap: ReturnType<typeof createBucketClientMap>,
  ): Promise<HostedAssetLock> =>
    getPlannedLock(
      await publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        otherLocks: [],
        product,
        plan: planHostedAssetPublication(publication),
        scopes,
      }),
    );
  const filesScope = TEST_FILENAME;
  const filesProduct: HostedAssetProduct = {
    ...filesProductBase,
    source: { folder: TEST_FILENAME, kind: "files", unhostedExtensions: [] },
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
      otherLocks: [],
      product,
      plan: planHostedAssetPublication(publication),
      scopes,
    });

    const plannedLock = getPlannedLock(result);
    expect(Object.keys(plannedLock.objects)).toStrictEqual([WEAPONS_KEY]);
    expect(Object.keys(plannedLock.indexes)).toStrictEqual([PROFILE_KEY]);
    expect(result).toStrictEqual({
      outcome: HostedAssetPublishOutcome.Published,
      plannedLock,
      storedObjectCount: 4,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 4, [CloudflareEnvironment.Production]: 4 },
    });
    expect(bucketClientMap[CloudflareEnvironment.Production].store.size).toBe(4);
  });

  test("a rerun of an unchanged plan makes no request", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = await publishPublication(bucketClientMap);
    const createBucketClientMapSpy = vi.fn<typeof createBucketClientMap>(() => bucketClientMap);
    const rerun = await publishHostedAssets({
      createBucketClientMap: createBucketClientMapSpy,
      currentLock,
      otherLocks: [],
      product,
      plan: planHostedAssetPublication(publication),
      scopes,
    });

    expect(rerun).toStrictEqual({ outcome: HostedAssetPublishOutcome.Unchanged });
    expect(createBucketClientMapSpy).not.toHaveBeenCalled();
  });

  // A publish that changes the lock stores again a record one environment lost although the lock names it. A publish that
  // Leaves the lock as it is makes no request, so the added object is the change that lists the buckets
  test.each([
    ["an object", false],
    ["an index", true],
  ])("stores %s an environment lost although the lock still names it", async (_label, isIndex) => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = await publishPublication(bucketClientMap);
    const record = takeOne(
      planHostedAssetPublication(publication).records.filter(({ isIndex: isRecordIndex }) => isRecordIndex === isIndex),
    );
    bucketClientMap[CloudflareEnvironment.Production].store.delete(getHostedAssetPath(record));

    const rerun = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      otherLocks: [],
      product,
      plan: planHostedAssetPublication(publicationWithShields),
      scopes,
    });

    expect(rerun).toStrictEqual({
      outcome: HostedAssetPublishOutcome.Published,
      plannedLock: getPlannedLock(rerun),
      storedObjectCount: 5,
      uploadedCountMap: { [CloudflareEnvironment.Development]: 1, [CloudflareEnvironment.Production]: 2 },
    });
    expect(bucketClientMap[CloudflareEnvironment.Production].store.size).toBe(5);
  });

  // The lock keeps the entries of the scopes a publish does not replace, so a bucket that lost one of their indexes fails the
  // Publish that replaces the others, rather than committing a lock that names a missing index
  test("a publish of one scope aborts when a bucket lost an index of another scope", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = await publishPublication(bucketClientMap);
    const index = takeOne(planHostedAssetPublication(publication).records.filter(({ isIndex }) => isIndex));
    bucketClientMap[CloudflareEnvironment.Production].store.delete(getHostedAssetPath(index));

    await expect(
      publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock,
        otherLocks: [],
        plan: planHostedAssetPublication({ indexes: {}, objects: { [WEAPONS_KEY]: [3] } }),
        product,
        scopes: [GameDataset.Stats],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: profile/English/0d19ddf594acba61ccf65a4c77ab29e2c72196acbaeddc167796e43f0d223e37.json, is named by a lock but missing from its bucket]`,
    );
  });

  // A record that changes is one new object, and its index is the only other object a lock change needs
  test("stores a changed record and its index only", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = await publishPublication(bucketClientMap);
    const changedPublication: HostedAssetPublication = {
      ...publication,
      indexes: { [PROFILE_KEY]: { ...publication.indexes[PROFILE_KEY], "10000003": { name: "c" } } },
    };
    const result = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      otherLocks: [],
      product,
      plan: planHostedAssetPublication(changedPublication),
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
      otherLocks: [],
      product,
      plan: planHostedAssetPublication(publication),
      scopes,
    });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(100 * DAY_MS));
    const result = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock: emptyLock,
      otherLocks: [],
      product,
      plan: planHostedAssetPublication(publication),
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
      indexes: { [PROFILE_KEY]: { alpha: { name: "a" }, beta: { name: "b" } } },
      objects: {},
    };
    // Inserted beta first, which an object literal would not keep in its written order
    const descending: HostedAssetPublication = {
      indexes: {
        [PROFILE_KEY]: Object.fromEntries([
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
        otherLocks: [],
        product,
        plan: planHostedAssetPublication(ascending),
        scopes,
      }),
    );
    const second = getPlannedLock(
      await publishHostedAssets({
        createBucketClientMap,
        currentLock: emptyLock,
        otherLocks: [],
        product,
        plan: planHostedAssetPublication(descending),
        scopes,
      }),
    );

    expect(formatHostedAssetLock(second)).toBe(formatHostedAssetLock(first));
  });

  // A dry run is the build alone: it names what it would publish, and with no bucket factory it reads and writes none
  test("names what it would publish without touching a bucket", async () => {
    expect.hasAssertions();

    const result = await publishHostedAssets({
      currentLock: emptyLock,
      otherLocks: [],
      product,
      plan: planHostedAssetPublication(publication),
      scopes,
    });

    // Nothing was published before, so the lock it would leave is the plan's own
    const plan = planHostedAssetPublication(publication);
    expect(result).toStrictEqual({
      nextLock: plan.lock,
      outcome: HostedAssetPublishOutcome.DryRun,
      records: plan.records,
      storedObjectCount: 4,
    });
  });

  // The lock can change with no upload: a scope that names entries the lock holds drops them when nothing replaces them
  test("an empty publication that drops a scope's entries still publishes the lock", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const currentLock = await publishPublication(bucketClientMap);
    const result = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      otherLocks: [],
      product,
      plan: planHostedAssetPublication({ indexes: {}, objects: {} }),
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
        otherLocks: [],
        product,
        plan: planHostedAssetPublication(publication),
        scopes,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[AggregateError: offline]`);
  });

  // A file's object is named by its bytes, so republishing the same bytes is the same object at the same url
  test("republishing unchanged bytes keeps the url", async () => {
    expect.hasAssertions();

    const bytes = Buffer.from(TEST_FILENAME);
    const files = [{ bytes, extension: ".png", key: TEST_FILENAME, sha256: getContentAddress(bytes) }];
    const bucketClientMap = createBucketClientMap();
    const currentLock = getPlannedLock(
      await publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        otherLocks: [],
        plan: planHostedAssetFiles(filesScope, files),
        product: filesProduct,
        scopes: [filesScope],
      }),
    );
    const rerun = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      otherLocks: [],
      plan: planHostedAssetFiles(filesScope, files),
      product: filesProduct,
      scopes: [filesScope],
    });

    expect(rerun).toStrictEqual({ outcome: HostedAssetPublishOutcome.Unchanged });
  });

  // A changed file is a new object, so its lock entry names the new bytes under their own hash
  test("changed bytes get a new url", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const changed = Buffer.from("");
    const currentLock = getPlannedLock(
      await publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        otherLocks: [],
        plan: planHostedAssetFiles(filesScope, [
          {
            bytes: Buffer.from(TEST_FILENAME),
            extension: ".png",
            key: TEST_FILENAME,
            sha256: getContentAddress(Buffer.from(TEST_FILENAME)),
          },
        ]),
        product: filesProduct,
        scopes: [filesScope],
      }),
    );
    const result = await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock,
      otherLocks: [],
      plan: planHostedAssetFiles(filesScope, [
        { bytes: changed, extension: ".png", key: TEST_FILENAME, sha256: getContentAddress(changed) },
      ]),
      product: filesProduct,
      scopes: [filesScope],
    });

    expect(getPlannedLock(result).objects[`${filesScope}/${TEST_FILENAME}`]).toStrictEqual({
      bytes: changed.byteLength,
      extension: ".png",
      scope: filesScope,
      sha256: getContentAddress(changed),
    });
  });

  // A file is stored as its extension's table names: a tsx brotli-encoded, its decoded bytes the ones its name hashes
  test("a published tsx is stored brotli-encoded under its content type, and its decoded bytes hash to its name", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const bytes = Buffer.from(TEST_FILENAME);
    const sha256 = getContentAddress(bytes);
    await publishHostedAssets({
      createBucketClientMap: () => bucketClientMap,
      currentLock: emptyLock,
      otherLocks: [],
      plan: planHostedAssetFiles(filesScope, [{ bytes, extension: ".tsx", key: "map.tsx", sha256 }]),
      product: filesProduct,
      scopes: [filesScope],
    });

    const stored = bucketClientMap[CloudflareEnvironment.Production].store.get(`${filesScope}/${sha256}.tsx`);
    expect(stored?.contentEncoding).toBe("br");
    expect(stored?.contentType).toBe(HOSTED_ASSET_CONTENT_TYPES[".tsx"]);
    await expect(
      readHostedAssetBytes(bucketClientMap[CloudflareEnvironment.Production], {
        bytes: bytes.byteLength,
        extension: ".tsx",
        scope: filesScope,
        sha256,
      }),
    ).resolves.toStrictEqual(bytes);
  });

  // The read back of each object the lock names is what stands between a bucket that stored other bytes and a lock
  // That names them
  test("a mismatched object stops the commit", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const productionBucket = bucketClientMap[CloudflareEnvironment.Production];
    const alteredPath = getHostedAssetPath(takeOne(planHostedAssetPublication(publication).records));
    const storedGet = productionBucket.get;
    vi.spyOn(productionBucket, "get").mockImplementation((key) =>
      key === alteredPath ? Promise.resolve(alteredBytes) : storedGet(key),
    );

    await expect(
      publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        otherLocks: [],
        product,
        plan: planHostedAssetPublication(publication),
        scopes,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: stats/weapons/49a64717d5d4cb19952e6eac2946415cf6879adacf9908e7d872332d32c6e684.json, does not hash to its name]`,
    );
  });

  // A stored object that no lock names is reused as it is while it is young, so only the read back catches other bytes
  // Stored under its name
  test("a reused object whose stored bytes are altered stops the commit", async () => {
    expect.hasAssertions();

    const bucketClientMap = createBucketClientMap();
    const alteredPath = getHostedAssetPath(takeOne(planHostedAssetPublication(publication).records));
    await bucketClientMap[CloudflareEnvironment.Production].put(alteredPath, new Uint8Array(alteredBytes));

    await expect(
      publishHostedAssets({
        createBucketClientMap: () => bucketClientMap,
        currentLock: emptyLock,
        otherLocks: [],
        product,
        plan: planHostedAssetPublication(publication),
        scopes,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: stats/weapons/49a64717d5d4cb19952e6eac2946415cf6879adacf9908e7d872332d32c6e684.json, does not hash to its name]`,
    );
  });

  test("rejects a scope another product's lock already declares", async () => {
    expect.hasAssertions();

    const otherLock: HostedAssetLock = {
      indexes: {},
      objects: {
        [WEAPONS_KEY]: {
          bytes: 0,
          extension: ".json",
          scope: WEAPONS_KEY,
          sha256: getContentAddress(Buffer.from(TEST_FILENAME)),
        },
      },
    };

    await expect(
      publishHostedAssets({
        currentLock: emptyLock,
        otherLocks: [otherLock],
        product,
        plan: planHostedAssetPublication(publication),
        scopes,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: stats, overlaps stats/weapons, which another product's lock declares]`,
    );
  });

  test("rejects a record published outside the scopes it names", async () => {
    expect.hasAssertions();

    await expect(
      publishHostedAssets({
        currentLock: emptyLock,
        otherLocks: [],
        product,
        plan: planHostedAssetPublication(publication),
        scopes: [GameDataset.Profile],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: stats/weapons, is published outside the scopes it names]`,
    );
  });
});
