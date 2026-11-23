import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { HostedAssetSourceFile } from "#src/models/hostedAssets/HostedAssetSourceFile";

import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { pullHostedAssetFiles } from "#src/services/hostedAssets/pullHostedAssetFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { CloudflareEnvironment, HostedAssetOriginMap, StorageBucket } from "@esposter/db-schema";
import { getContentAddress } from "@esposter/shared-node/cache";
import { getHostedAssetUrl } from "hosted-assets";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(pullHostedAssetFiles, () => {
  const baseUrl = HostedAssetOriginMap[CloudflareEnvironment.Development];
  const folder = TEST_FILENAME;
  const product: HostedAssetProduct = {
    bucket: StorageBucket.PublicHostedAssets,
    lockPath: TEST_FILENAME,
    lockRepositoryPath: TEST_FILENAME,
    name: TEST_FILENAME,
    scopes: [TEST_FILENAME],
    source: { folder, kind: "files", unhostedExtensions: [] },
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

  // The origin serves each stored object at its url, and answers any other url with a missing object
  const serve = (records: HostedAssetRecord[]) => {
    const bodies = new Map(records.map((record) => [getHostedAssetUrl(baseUrl, record), record.bytes]));
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const bytes = typeof url === "string" ? bodies.get(url) : undefined;
      return Promise.resolve(
        bytes === undefined ? new Response(null, { status: 404 }) : new Response(new Uint8Array(bytes)),
      );
    });
  };

  beforeEach(async () => {
    repositoryRoot = await mkdtemp(join(tmpdir(), "hosted-asset-pull-"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(repositoryRoot, { force: true, recursive: true });
  });

  test("pull --all on a lock of two objects writes both", async () => {
    expect.hasAssertions();

    // The objects as a publish stored them under the origin, and the lock that names them
    const { lock, records } = planHostedAssetFiles(TEST_FILENAME, files);
    serve(records);

    await expect(pullHostedAssetFiles(baseUrl, product, lock, [keyA, keyB], repositoryRoot)).resolves.toBe(2);
    await expect(readFile(join(repositoryRoot, folder, keyA))).resolves.toStrictEqual(bytesA);
    await expect(readFile(join(repositoryRoot, folder, keyB))).resolves.toStrictEqual(bytesB);
  });

  test("a lock key that leaves the folder is refused before any file is written", async () => {
    expect.hasAssertions();

    // The lock names a key with a parent segment, and its object is on the origin, so only the path check can refuse it
    const escaping = {
      bytes: bytesA,
      extension: ".png",
      key: `../${TEST_FILENAME}.png`,
      sha256: getContentAddress(bytesA),
    };
    const { lock, records } = planHostedAssetFiles(TEST_FILENAME, [escaping]);
    serve(records);

    await expect(
      pullHostedAssetFiles(baseUrl, product, lock, [escaping.key], repositoryRoot),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: ../a.png, leaves its product's folder]`,
    );
  });
});
