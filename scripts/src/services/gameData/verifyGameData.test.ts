import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { getGameDataHash } from "#src/services/gameData/getGameDataHash";
import { verifyGameData } from "#src/services/gameData/verifyGameData";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(verifyGameData, () => {
  const baseUrl = "https://account.example/app-assets";
  // Each record is named by the hash of its own compact JSON, as the account stores it
  const createStoredRecord = (value: unknown) => {
    const json = JSON.stringify(value);
    const hash = getGameDataHash(json);
    return { hash, json, url: `${baseUrl}/${getGameDataBlobName(hash)}` };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("fetches each object the lock reaches once and counts the distinct ones", async () => {
    expect.hasAssertions();

    const entry = createStoredRecord({ name: "a" });
    // One record is both an object of the lock and an entry of its index, so it must be fetched once
    const shared = createStoredRecord([1, 2]);
    const index = createStoredRecord({ "10000002": entry.hash, "10000003": shared.hash });
    const storedRecords = [entry, shared, index];
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((url) =>
        Promise.resolve(new Response(storedRecords.find((record) => record.url === url)?.json)),
      );

    await expect(
      verifyGameData(baseUrl, {
        indexes: { "profile/English": index.hash },
        objects: { "stats/weapons": shared.hash },
      }),
    ).resolves.toBe(3);
    // Three calls naming three distinct URLs, so each object is fetched exactly once
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual(
      expect.arrayContaining([entry.url, index.url, shared.url]),
    );
  });
});
