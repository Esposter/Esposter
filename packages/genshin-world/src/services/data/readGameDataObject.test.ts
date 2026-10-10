import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { afterEach, describe, expect, test, vi } from "vitest";

// Reads are memoized for the page's lifetime, so each test names an object no other test reads
describe(readGameDataObject, () => {
  const gameDataBaseUrl = "game-data";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shares one fetch between reads of an object that are in flight together", async () => {
    expect.hasAssertions();

    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ id: 1 }));

    await expect(
      Promise.all([readGameDataObject(gameDataBaseUrl, "shared"), readGameDataObject(gameDataBaseUrl, "shared")]),
    ).resolves.toStrictEqual([{ id: 1 }, { id: 1 }]);
    // The fetch is named by its URL alone, since the signal it is given is one a test cannot hold to a value
    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual([`${gameDataBaseUrl}/shared.json`]);
  });

  // A failed read is not remembered, or one dropped request would hold a table out of the world until the page reloads
  test("reads an object again after its fetch failed", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 503, statusText: "Service Unavailable" }))
      .mockResolvedValueOnce(Response.json({ id: 2 }));

    await expect(readGameDataObject(gameDataBaseUrl, "retried")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: game-data/retried.json, HTTP 503 Service Unavailable]`,
    );
    await expect(readGameDataObject(gameDataBaseUrl, "retried")).resolves.toStrictEqual({ id: 2 });
  });
});
