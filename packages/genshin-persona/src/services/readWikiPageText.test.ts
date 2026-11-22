import { readWikiPageText } from "#src/services/readWikiPageText";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readWikiPageText, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("reads a page the wiki answers in another shape as holding no text", async () => {
    expect.hasAssertions();

    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ parse: { wikitext: { "*": 0 } } }))),
    );

    await expect(readWikiPageText("Page")).resolves.toBe("");
  });
});
