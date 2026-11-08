import { fetchWikiPage } from "#src/services/genshinAssets/enemies/fetchWikiPage";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(fetchWikiPage, () => {
  let cacheDirectory: string;

  beforeEach(async () => {
    cacheDirectory = await mkdtemp(join(tmpdir(), "fetch-wiki-page-"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(cacheDirectory, { force: true, recursive: true });
  });

  test("a page the wiki answers with no revision is refused and not cached", async () => {
    expect.hasAssertions();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ query: { pages: [{ ns: 0, pageid: 1, revisions: [], title: "Slimes" }] } }),
    );
    const cachePath = join(cacheDirectory, "Page_Slimes.json");

    await expect(fetchWikiPage("Slimes", cachePath)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Slimes, is not a page on the wiki]`,
    );
    expect(existsSync(cachePath)).toBe(false);
  });
});
