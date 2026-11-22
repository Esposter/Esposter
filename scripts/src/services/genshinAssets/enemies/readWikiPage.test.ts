import { readWikiPage } from "#src/services/genshinAssets/enemies/readWikiPage";
import { toWikiPageCachePath } from "#src/services/genshinAssets/enemies/toWikiPageCachePath";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(readWikiPage, () => {
  let cacheDirectory: string;

  beforeEach(async () => {
    cacheDirectory = await mkdtemp(join(tmpdir(), "read-wiki-page-"));
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

    await expect(readWikiPage(cacheDirectory, "Slimes")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Slimes, is not a page on the wiki]`,
    );
    expect(existsSync(toWikiPageCachePath(cacheDirectory, "Slimes"))).toBe(false);
  });
});
