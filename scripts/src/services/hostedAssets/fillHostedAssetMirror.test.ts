import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { createHostedAssetLockObject } from "#src/services/hostedAssets/createHostedAssetLockObject.test";
import { createStoredHostedAssetRecord } from "#src/services/hostedAssets/createStoredHostedAssetRecord.test";
import { fillHostedAssetMirror } from "#src/services/hostedAssets/fillHostedAssetMirror";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(fillHostedAssetMirror, () => {
  const PROFILE_ENGLISH_KEY = "profile/English";
  const STATS_WEAPONS_KEY = "stats/weapons";
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

    const entry = createStoredHostedAssetRecord(GAME_DATA_DEV_BASE_URL, PROFILE_ENGLISH_KEY, { name: "name" });
    const shared = createStoredHostedAssetRecord(GAME_DATA_DEV_BASE_URL, STATS_WEAPONS_KEY, [1, 2]);
    const index = createStoredHostedAssetRecord(GAME_DATA_DEV_BASE_URL, PROFILE_ENGLISH_KEY, { [v7()]: entry.sha256 });
    const records = [entry, shared, index];
    vi.spyOn(globalThis, "fetch").mockImplementation((url) =>
      Promise.resolve(new Response(records.find((record) => record.url === url)?.json)),
    );

    await expect(
      fillHostedAssetMirror(
        GAME_DATA_DEV_BASE_URL,
        {
          indexes: { [PROFILE_ENGLISH_KEY]: createHostedAssetLockObject(PROFILE_ENGLISH_KEY, index.sha256) },
          objects: { [STATS_WEAPONS_KEY]: createHostedAssetLockObject(STATS_WEAPONS_KEY, shared.sha256) },
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

    const record = createStoredHostedAssetRecord(GAME_DATA_DEV_BASE_URL, STATS_WEAPONS_KEY, { name: "name" });
    await writeFile(join(mirrorDirectory, record.sha256), "");
    const fetch = vi.spyOn(globalThis, "fetch");

    await expect(
      fillHostedAssetMirror(
        GAME_DATA_DEV_BASE_URL,
        {
          indexes: {},
          objects: { [STATS_WEAPONS_KEY]: createHostedAssetLockObject(STATS_WEAPONS_KEY, record.sha256) },
        },
        mirrorDirectory,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://hosted.dev.esposter.com/stats/weapons/03b541ca8efb6e8040c2153af7b9c1128c1a5dbf84cc91ae28d0db952e95e667.json, does not hash to its name]`,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
