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
    const url = `${gameDataBaseUrl}/stats/weapons/shared.json`;

    await expect(Promise.all([readGameDataObject(url), readGameDataObject(url)])).resolves.toStrictEqual([
      { id: 1 },
      { id: 1 },
    ]);
    // The fetch is named by its URL alone, since the signal it is given is one a test cannot hold to a value
    expect(fetch.mock.calls.map(([fetchUrl]) => fetchUrl)).toStrictEqual([url]);
  });

  // A failed read is not remembered, or one dropped request would hold a table out of the world until the page reloads
  test("reads an object again after its fetch failed", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 503, statusText: "Service Unavailable" }))
      .mockResolvedValueOnce(Response.json({ id: 2 }));
    const url = `${gameDataBaseUrl}/stats/weapons/retried.json`;

    await expect(readGameDataObject(url)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: game-data/stats/weapons/retried.json, HTTP 503 Service Unavailable]`,
    );
    await expect(readGameDataObject(url)).resolves.toStrictEqual({ id: 2 });
  });

  // A host answering OK with a page that is not JSON is held in the cache before it is parsed, so the held copy is
  // Dropped too, or the next read would fail on it without a fetch
  test("reads an object again after a 200 body that is not JSON", async () => {
    expect.hasAssertions();

    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("<html></html>", { headers: { "Content-Type": "text/html" } }))
      .mockResolvedValueOnce(Response.json({ id: 3 }));
    const url = `${gameDataBaseUrl}/stats/weapons/not-json.json`;

    await expect(readGameDataObject(url)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[SyntaxError: Unexpected token '<', "<html></html>" is not valid JSON]`,
    );
    await expect(readGameDataObject(url)).resolves.toStrictEqual({ id: 3 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
