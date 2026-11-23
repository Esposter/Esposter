import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { createHostedAssetLockObject } from "#src/services/hostedAssets/createHostedAssetLockObject.test";
import { createStoredHostedAssetRecord } from "#src/services/hostedAssets/createStoredHostedAssetRecord.test";
import { verifyHostedAssets } from "#src/services/hostedAssets/verifyHostedAssets";
import { getContentAddress } from "@esposter/shared-node/cache";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(verifyHostedAssets, () => {
  const baseUrl = GAME_DATA_DEV_BASE_URL;
  const PROFILE_ENGLISH_KEY = "profile/English";
  const STATS_WEAPONS_KEY = "stats/weapons";
  const INDEX_ENTRY_KEY = "10000002";
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("fetches each object the lock reaches once and counts the distinct ones", async () => {
    expect.hasAssertions();

    const entry = createStoredHostedAssetRecord(baseUrl, PROFILE_ENGLISH_KEY, { name: "name" });
    const shared = createStoredHostedAssetRecord(baseUrl, STATS_WEAPONS_KEY, [1, 2]);
    // Two entries of the index name one record, so it must be fetched once
    const index = createStoredHostedAssetRecord(baseUrl, PROFILE_ENGLISH_KEY, {
      "10000003": entry.sha256,
      [INDEX_ENTRY_KEY]: entry.sha256,
    });
    const storedRecords = [entry, shared, index];
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((url) =>
        Promise.resolve(new Response(storedRecords.find((record) => record.url === url)?.json)),
      );

    await expect(
      verifyHostedAssets(baseUrl, {
        indexes: { [PROFILE_ENGLISH_KEY]: createHostedAssetLockObject(PROFILE_ENGLISH_KEY, index.sha256, index.bytes) },
        objects: { [STATS_WEAPONS_KEY]: createHostedAssetLockObject(STATS_WEAPONS_KEY, shared.sha256, shared.bytes) },
      }),
    ).resolves.toBe(3);
    // Three calls naming three distinct URLs, so each object is fetched exactly once
    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual([index.url, shared.url, entry.url]);
  });

  test("an index that does not hash to its name is refused", async () => {
    expect.hasAssertions();

    const entry = createStoredHostedAssetRecord(baseUrl, PROFILE_ENGLISH_KEY, { name: "name" });
    const index = createStoredHostedAssetRecord(baseUrl, PROFILE_ENGLISH_KEY, { [INDEX_ENTRY_KEY]: entry.sha256 });
    // The bucket serves other content under the index's name
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ [INDEX_ENTRY_KEY]: getContentAddress(Buffer.from("b")) }));

    await expect(
      verifyHostedAssets(baseUrl, {
        indexes: { [PROFILE_ENGLISH_KEY]: createHostedAssetLockObject(PROFILE_ENGLISH_KEY, index.sha256) },
        objects: {},
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://hosted.dev.esposter.com/profile/English/665993241baf18cd37c69a7b3553472d713aafedddf98130ed24896c0cf8783b.json, does not hash to its name]`,
    );
    // Only the index was fetched, so none of the entries it names was
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("an object stored as other bytes than its name's is refused", async () => {
    expect.hasAssertions();

    const value = { name: "name" };
    const record = createStoredHostedAssetRecord(baseUrl, PROFILE_ENGLISH_KEY, value);
    // The same value indented: it parses to what the name hashes, but its own bytes do not hash to the name
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(value, null, 2)));

    await expect(
      verifyHostedAssets(baseUrl, {
        indexes: {},
        objects: { [PROFILE_ENGLISH_KEY]: createHostedAssetLockObject(PROFILE_ENGLISH_KEY, record.sha256) },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://hosted.dev.esposter.com/profile/English/03b541ca8efb6e8040c2153af7b9c1128c1a5dbf84cc91ae28d0db952e95e667.json, does not hash to its name]`,
    );
  });

  test("an object whose decoded length is not its lock's bytes is refused", async () => {
    expect.hasAssertions();

    const record = createStoredHostedAssetRecord(baseUrl, STATS_WEAPONS_KEY, [1, 2]);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(record.json));

    await expect(
      verifyHostedAssets(baseUrl, {
        indexes: {},
        objects: {
          [STATS_WEAPONS_KEY]: createHostedAssetLockObject(STATS_WEAPONS_KEY, record.sha256, record.bytes + 1),
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://hosted.dev.esposter.com/stats/weapons/49a64717d5d4cb19952e6eac2946415cf6879adacf9908e7d872332d32c6e684.json, is 5 bytes, not the 6 its lock records]`,
    );
  });
});
