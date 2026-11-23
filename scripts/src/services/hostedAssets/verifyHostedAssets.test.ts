import { createHostedAssetLockObject } from "#src/services/hostedAssets/createHostedAssetLockObject.test";
import { createStoredHostedAssetRecord } from "#src/services/hostedAssets/createStoredHostedAssetRecord.test";
import { verifyHostedAssets } from "#src/services/hostedAssets/verifyHostedAssets";
import { getContentAddress } from "@esposter/shared-node/cache";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(verifyHostedAssets, () => {
  const baseUrl = "https://bucket.example/public-genshin-assets";
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("fetches each object the lock reaches once and counts the distinct ones", async () => {
    expect.hasAssertions();

    const entry = createStoredHostedAssetRecord(baseUrl, "profile/English", { name: "name" });
    const shared = createStoredHostedAssetRecord(baseUrl, "stats/weapons", [1, 2]);
    // Two entries of the index name one record, so it must be fetched once
    const index = createStoredHostedAssetRecord(baseUrl, "profile/English", {
      "10000002": entry.sha256,
      "10000003": entry.sha256,
    });
    const storedRecords = [entry, shared, index];
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((url) =>
        Promise.resolve(new Response(storedRecords.find((record) => record.url === url)?.json)),
      );

    await expect(
      verifyHostedAssets(baseUrl, {
        indexes: { "profile/English": createHostedAssetLockObject("profile/English", index.sha256, index.bytes) },
        objects: { "stats/weapons": createHostedAssetLockObject("stats/weapons", shared.sha256, shared.bytes) },
      }),
    ).resolves.toBe(3);
    // Three calls naming three distinct URLs, so each object is fetched exactly once
    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual([index.url, shared.url, entry.url]);
  });

  test("an index that does not hash to its name is refused", async () => {
    expect.hasAssertions();

    const entry = createStoredHostedAssetRecord(baseUrl, "profile/English", { name: "name" });
    const index = createStoredHostedAssetRecord(baseUrl, "profile/English", { "10000002": entry.sha256 });
    // The bucket serves other content under the index's name
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ "10000002": getContentAddress(Buffer.from("b")) }));

    await expect(
      verifyHostedAssets(baseUrl, {
        indexes: { "profile/English": createHostedAssetLockObject("profile/English", index.sha256) },
        objects: {},
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://bucket.example/public-genshin-assets/profile/English/665993241baf18cd37c69a7b3553472d713aafedddf98130ed24896c0cf8783b.json, does not hash to its name]`,
    );
    // Only the index was fetched, so none of the entries it names was
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("an object stored as other bytes than its name's is refused", async () => {
    expect.hasAssertions();

    const value = { name: "name" };
    const record = createStoredHostedAssetRecord(baseUrl, "profile/English", value);
    // The same value indented: it parses to what the name hashes, but its own bytes do not hash to the name
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(value, null, 2)));

    await expect(
      verifyHostedAssets(baseUrl, {
        indexes: {},
        objects: { "profile/English": createHostedAssetLockObject("profile/English", record.sha256) },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://bucket.example/public-genshin-assets/profile/English/03b541ca8efb6e8040c2153af7b9c1128c1a5dbf84cc91ae28d0db952e95e667.json, does not hash to its name]`,
    );
  });

  test("an object whose decoded length is not its lock's bytes is refused", async () => {
    expect.hasAssertions();

    const record = createStoredHostedAssetRecord(baseUrl, "stats/weapons", [1, 2]);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(record.json));

    await expect(
      verifyHostedAssets(baseUrl, {
        indexes: {},
        objects: { "stats/weapons": createHostedAssetLockObject("stats/weapons", record.sha256, record.bytes + 1) },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://bucket.example/public-genshin-assets/stats/weapons/49a64717d5d4cb19952e6eac2946415cf6879adacf9908e7d872332d32c6e684.json, is 5 bytes, not the 6 its lock records]`,
    );
  });
});
