import { WIKI_ORIGIN } from "#src/services/constants";
import { readWikiJson } from "#src/services/readWikiJson";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readWikiJson, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("reads an answer past its ceiling as absent rather than parsing it", async () => {
    expect.hasAssertions();

    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ answer: "held whole" }))),
    );

    await expect(
      readWikiJson(WIKI_ORIGIN, (value): value is object => typeof value === "object", 4),
    ).resolves.toBeUndefined();
  });
});
