import { createHostedAssetLockObject } from "#src/services/hostedAssets/createHostedAssetLockObject.test";
import { createStoredHostedAssetRecord } from "#src/services/hostedAssets/createStoredHostedAssetRecord.test";
import { fillHostedAssetMirror } from "#src/services/hostedAssets/fillHostedAssetMirror";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(fillHostedAssetMirror, () => {
  const baseUrl = "https://bucket.example/public-genshin-assets";
  let mirrorDirectory: string;

  beforeEach(async () => {
    mirrorDirectory = await mkdtemp(join(tmpdir(), "hosted-assets-mirror-"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(mirrorDirectory, { force: true, recursive: true });
  });

  // A mirror saved for the shards holds the entries an index names, which the lock itself never lists
  test("fills the lock's objects, its indexes and every entry they name", async () => {
    expect.hasAssertions();

    const entry = createStoredHostedAssetRecord(baseUrl, "profile/English", { name: "name" });
    const shared = createStoredHostedAssetRecord(baseUrl, "stats/weapons", [1, 2]);
    const index = createStoredHostedAssetRecord(baseUrl, "profile/English", { "10000002": entry.sha256 });
    const records = [entry, shared, index];
    vi.spyOn(globalThis, "fetch").mockImplementation((url) =>
      Promise.resolve(new Response(records.find((record) => record.url === url)?.json)),
    );

    await expect(
      fillHostedAssetMirror(
        baseUrl,
        {
          indexes: { "profile/English": createHostedAssetLockObject("profile/English", index.sha256) },
          objects: { "stats/weapons": createHostedAssetLockObject("stats/weapons", shared.sha256) },
        },
        mirrorDirectory,
      ),
    ).resolves.toBe(3);
    expect((await readdir(mirrorDirectory)).toSorted()).toStrictEqual(
      [entry.sha256, shared.sha256, index.sha256].toSorted(),
    );
  });

  // The mirror is read before it is trusted, so a cached file that is not its name's bytes stops the fill
  test("a cached object that is not its name's bytes fails the fill", async () => {
    expect.hasAssertions();

    const record = createStoredHostedAssetRecord(baseUrl, "stats/weapons", { name: "name" });
    await writeFile(join(mirrorDirectory, record.sha256), "b");
    const fetch = vi.spyOn(globalThis, "fetch");

    await expect(
      fillHostedAssetMirror(
        baseUrl,
        { indexes: {}, objects: { "stats/weapons": createHostedAssetLockObject("stats/weapons", record.sha256) } },
        mirrorDirectory,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://bucket.example/public-genshin-assets/stats/weapons/03b541ca8efb6e8040c2153af7b9c1128c1a5dbf84cc91ae28d0db952e95e667.json, does not hash to its name]`,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
