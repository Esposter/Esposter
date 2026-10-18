import { readAccountCharacterPackFile } from "#src/services/character/readAccountCharacterPackFile";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readAccountCharacterPackFile, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("an account file the host answers 404 for is refused, not absent", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(undefined, { status: 404, statusText: "Not Found" }));

    await expect(
      readAccountCharacterPackFile("/account", [{ path: "b", sha256: "a" }], "b"),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: /account/a, HTTP 404 Not Found]`,
    );
  });
});
