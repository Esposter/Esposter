import { readCharacterPackFile } from "#src/services/character/readCharacterPackFile";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readCharacterPackFile, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads a file under its character, each part of the path the model names encoded on its own", async () => {
    expect.hasAssertions();

    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response());
    await readCharacterPackFile("", 1, String.raw`.\b/ `, 0);

    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual(["/1/b/%20"]);
  });
});
