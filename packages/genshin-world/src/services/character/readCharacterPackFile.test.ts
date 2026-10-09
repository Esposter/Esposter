import { readCharacterPackFile } from "#src/services/character/readCharacterPackFile";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/data/gameDataLock"), () => ({
  gameDataLock: { indexes: {}, objects: { "characterPacks/1": "a" } },
}));

describe(readCharacterPackFile, () => {
  const characterPackBaseUrl = "";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads a file under its pack's hash, each part of the path the model names encoded on its own", async () => {
    expect.hasAssertions();

    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response());
    await readCharacterPackFile(characterPackBaseUrl, 1, String.raw`.\b/ `, 0);

    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual(["/1/a/b/%20"]);
  });

  test("refuses a character the lock names no pack for without a request", async () => {
    expect.hasAssertions();

    const fetch = vi.spyOn(globalThis, "fetch");

    await expect(readCharacterPackFile(characterPackBaseUrl, 2, "", 0)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 2, has no character pack published]`,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
