import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetSourceFile } from "#src/models/hostedAssets/HostedAssetSourceFile";

import { createMemoryR2BucketClient } from "#src/services/cloudflare/createMemoryR2BucketClient.test";
import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { pullHostedAssetFiles } from "#src/services/hostedAssets/pullHostedAssetFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { StorageBucket } from "@esposter/db-schema";
import { getContentAddress } from "@esposter/shared-node/cache";
import { getHostedAssetPath } from "hosted-assets";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(pullHostedAssetFiles, () => {
  const folder = TEST_FILENAME;
  const product: HostedAssetProduct = {
    bucket: StorageBucket.PublicHostedAssets,
    lockPath: TEST_FILENAME,
    lockRepositoryPath: TEST_FILENAME,
    name: TEST_FILENAME,
    scopes: [TEST_FILENAME],
    source: { folder, kind: "files" },
  };
  const bytesA = Buffer.from(TEST_FILENAME);
  const bytesB = Buffer.from("");
  const keyA = `${TEST_FILENAME}.png`;
  const keyB = `${TEST_FILENAME}/${TEST_FILENAME}.png`;
  const files: HostedAssetSourceFile[] = [
    { bytes: bytesA, extension: ".png", key: keyA, sha256: getContentAddress(bytesA) },
    { bytes: bytesB, extension: ".png", key: keyB, sha256: getContentAddress(bytesB) },
  ];
  let repositoryRoot: string;

  beforeEach(async () => {
    repositoryRoot = await mkdtemp(join(tmpdir(), "hosted-asset-pull-"));
  });

  afterEach(async () => {
    await rm(repositoryRoot, { force: true, recursive: true });
  });

  test("pull --all on a lock of two objects writes both", async () => {
    expect.hasAssertions();

    // The objects as a publish stored them, and the lock that names them
    const { lock, records } = planHostedAssetFiles(TEST_FILENAME, files);
    const bucketClient = createMemoryR2BucketClient();
    await Promise.all(
      records.map((record) => bucketClient.put(getHostedAssetPath(record), new Uint8Array(record.bytes))),
    );

    await expect(pullHostedAssetFiles(() => bucketClient, product, lock, [keyA, keyB], repositoryRoot)).resolves.toBe(
      2,
    );
    await expect(readFile(join(repositoryRoot, folder, keyA))).resolves.toStrictEqual(bytesA);
    await expect(readFile(join(repositoryRoot, folder, keyB))).resolves.toStrictEqual(bytesB);
  });
});
