import { createGameDataLockObject } from "#src/services/gameData/createGameDataLockObject.test";
import { getGameDataHash } from "#src/services/gameData/getGameDataHash";
import { verifyGameData } from "#src/services/gameData/verifyGameData";
import { getGameDataObjectName } from "genshin-world";
import { getHostedAssetUrl } from "hosted-assets";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(verifyGameData, () => {
  const baseUrl = "https://bucket.example/public-genshin-assets";
  // Each record is named by the hash of its own compact JSON, and stored under the dataset it is published under
  const createStoredRecord = (dataset: string, value: unknown) => {
    const json = JSON.stringify(value);
    const hash = getGameDataHash(json);
    return { hash, json, url: getHostedAssetUrl(baseUrl, getGameDataObjectName(dataset, hash)) };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("fetches each object the lock reaches once and counts the distinct ones", async () => {
    expect.hasAssertions();

    const entry = createStoredRecord("profile/English", { name: "a" });
    const shared = createStoredRecord("stats/weapons", [1, 2]);
    // Two entries of the index name one record, so it must be fetched once
    const index = createStoredRecord("profile/English", { "10000002": entry.hash, "10000003": entry.hash });
    const storedRecords = [entry, shared, index];
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((url) =>
        Promise.resolve(new Response(storedRecords.find((record) => record.url === url)?.json)),
      );

    await expect(
      verifyGameData(baseUrl, {
        indexes: { "profile/English": createGameDataLockObject("profile/English", index.hash) },
        objects: { "stats/weapons": createGameDataLockObject("stats/weapons", shared.hash) },
      }),
    ).resolves.toBe(3);
    // Three calls naming three distinct URLs, so each object is fetched exactly once
    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual([index.url, shared.url, entry.url]);
  });

  test("an index that does not hash to its name is refused", async () => {
    expect.hasAssertions();

    const entry = createStoredRecord("profile/English", { name: "a" });
    const index = createStoredRecord("profile/English", { "10000002": entry.hash });
    // The bucket serves other content under the index's name
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ "10000002": getGameDataHash("b") }));

    await expect(
      verifyGameData(baseUrl, {
        indexes: { "profile/English": createGameDataLockObject("profile/English", index.hash) },
        objects: {},
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://bucket.example/public-genshin-assets/profile/English/2709f82fb9bd4917c3e5f7617f1f22fa906116a4ae4447125391ff760f2ff17a.json, does not hash to its name]`,
    );
    // Only the index was fetched, so none of the entries it names was
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("an object stored as other bytes than its name's is refused", async () => {
    expect.hasAssertions();

    const value = { name: "a" };
    const record = createStoredRecord("profile/English", value);
    // The same value indented: it parses to what the name hashes, but its own bytes do not hash to the name
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(value, null, 2)));

    await expect(
      verifyGameData(baseUrl, {
        indexes: {},
        objects: { "profile/English": createGameDataLockObject("profile/English", record.hash) },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://bucket.example/public-genshin-assets/profile/English/d9d719b27480b55cd4918020e7473e716ed3569c8adafe926cf9b10b4f8ef064.json, does not hash to its name]`,
    );
  });
});
