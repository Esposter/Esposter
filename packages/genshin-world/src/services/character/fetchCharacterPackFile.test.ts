import { fetchCharacterPackFile } from "#src/services/character/fetchCharacterPackFile";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(fetchCharacterPackFile, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("fetches the url under the timeout and answers its response", async () => {
    expect.hasAssertions();

    const response = new Response();
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    await expect(fetchCharacterPackFile("/1/b", 0)).resolves.toBe(response);
    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual(["/1/b"]);
  });

  test("answers none where the absent status is given and the host answers it", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(undefined, { status: 404 }));

    await expect(fetchCharacterPackFile("/1/b", 0, 404)).resolves.toBeUndefined();
  });

  test("rejects the absent status where no absent status is given", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(undefined, { status: 404, statusText: "Missing" }));

    await expect(fetchCharacterPackFile("/1/b", 0)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: /1/b, HTTP 404 Missing]`,
    );
  });

  test("rejects a status other than the absent one", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(undefined, { status: 500, statusText: "Failed" }));

    await expect(fetchCharacterPackFile("/1/b", 0, 404)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: /1/b, HTTP 500 Failed]`,
    );
  });
});
