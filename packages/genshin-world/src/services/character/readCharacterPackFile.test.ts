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

  test("reads no file where the host answers that its pack holds none", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(undefined, { status: 404 }));

    await expect(readCharacterPackFile("", 1, "b", 0)).resolves.toBeUndefined();
  });

  test("rejects a file the host fails to serve", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(undefined, { status: 500, statusText: "Failed" }));

    await expect(readCharacterPackFile("", 1, "b", 0)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: /1/b, HTTP 500 Failed]`,
    );
  });
});
