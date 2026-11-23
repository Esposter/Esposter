import { fetchJson } from "#src/services/shared/fetchJson";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(fetchJson, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("refuses a body past its ceiling rather than parsing it", async () => {
    expect.hasAssertions();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ answer: "held whole" }));

    await expect(fetchJson("https://example.invalid/answer.json", 4)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://example.invalid/answer.json, its body is past 4 bytes]`,
    );
  });
});
