import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetPublication } from "#src/models/hostedAssets/HostedAssetPublication";

import { createMemoryR2BucketClientMap } from "#src/services/cloudflare/createMemoryR2BucketClientMap.test";
import { filesProductBase } from "#src/services/hostedAssets/constants.test";
import { planHostedAssetPublication } from "#src/services/hostedAssets/planHostedAssetPublication";
import { publishHostedAssets } from "#src/services/hostedAssets/publishHostedAssets";
import { readHostedAssetBytes } from "#src/services/hostedAssets/readHostedAssetBytes";
import { repairHostedAssets } from "#src/services/hostedAssets/repairHostedAssets";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { takeOne, ZERO_UUID } from "@esposter/shared";
import { getContentAddress } from "@esposter/shared-node/cache";
import { getHostedAssetPath } from "hosted-assets";
import { describe, expect, test } from "vitest";

describe(repairHostedAssets, () => {
  const product: HostedAssetProduct = { ...filesProductBase, source: { kind: "records" } };
  // One object and an index holding one entry, so a repair reads an index to reach the entry it names
  const publication: HostedAssetPublication = {
    indexes: { [TEST_FILENAME]: { [ZERO_UUID]: { name: TEST_FILENAME } } },
    objects: { [TEST_FILENAME]: [0] },
  };
  // The bytes an object is altered to, which no hash of its name matches
  const alteredBytes = Buffer.from(" ");

  // Publishes the publication into both buckets from no lock.
  // It returns the buckets with the lock it planned, and the object and index that lock names.
  // A publish that is refused throws, so its result needs no check of its own.
  const publish = async () => {
    const buckets = createMemoryR2BucketClientMap();
    const plan = planHostedAssetPublication(publication);
    await publishHostedAssets({
      createBucketClientMap: () => buckets,
      currentLock: { indexes: {}, objects: {} },
      otherLocks: [],
      plan,
      product,
      scopes: [TEST_FILENAME],
    });
    return {
      buckets,
      index: takeOne(Object.values(plan.lock.indexes), 0),
      lock: plan.lock,
      object: takeOne(Object.values(plan.lock.objects), 0),
    };
  };

  test("a lost object is restored from the other bucket", async () => {
    expect.hasAssertions();

    const { buckets, index, lock, object } = await publish();
    await buckets[CloudflareEnvironment.Production].delete(getHostedAssetPath(object));
    await buckets[CloudflareEnvironment.Production].delete(getHostedAssetPath(index));

    await expect(repairHostedAssets(product, lock, buckets, false)).resolves.toBe(`${TEST_FILENAME}: copied 2`);
    expect(getContentAddress(await readHostedAssetBytes(buckets[CloudflareEnvironment.Production], object))).toBe(
      object.sha256,
    );
    expect(getContentAddress(await readHostedAssetBytes(buckets[CloudflareEnvironment.Production], index))).toBe(
      index.sha256,
    );
  });

  test("a source object whose bytes do not hash to its name is refused", async () => {
    expect.hasAssertions();

    const { buckets, lock, object } = await publish();
    await buckets[CloudflareEnvironment.Production].delete(getHostedAssetPath(object));
    await buckets[CloudflareEnvironment.Development].put(getHostedAssetPath(object), alteredBytes);

    await expect(repairHostedAssets(product, lock, buckets, false)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/d0bca111f8628137adc4c16f123496dcdd1d590d06cb5d9acd68b39fe656fb97.json, does not hash to its name]`,
    );
    expect(buckets[CloudflareEnvironment.Production].store.has(getHostedAssetPath(object))).toBe(false);
  });

  test("a key lost from both buckets fails the repair naming it", async () => {
    expect.hasAssertions();

    const { buckets, lock, object } = await publish();
    await buckets[CloudflareEnvironment.Development].delete(getHostedAssetPath(object));
    await buckets[CloudflareEnvironment.Production].delete(getHostedAssetPath(object));

    await expect(repairHostedAssets(product, lock, buckets, false)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/d0bca111f8628137adc4c16f123496dcdd1d590d06cb5d9acd68b39fe656fb97.json, is named by a lock but missing from both buckets: republish the product from its source to restore it]`,
    );
  });

  test("a dry run names each copy and writes nothing", async () => {
    expect.hasAssertions();

    const { buckets, lock, object } = await publish();
    await buckets[CloudflareEnvironment.Production].delete(getHostedAssetPath(object));

    await expect(repairHostedAssets(product, lock, buckets, true)).resolves.toBe(
      `${TEST_FILENAME}: dry run, nothing written\n  ${getHostedAssetPath(object)}: ${CloudflareEnvironment.Development} to ${CloudflareEnvironment.Production}`,
    );
    expect(buckets[CloudflareEnvironment.Production].store.has(getHostedAssetPath(object))).toBe(false);
  });
});
