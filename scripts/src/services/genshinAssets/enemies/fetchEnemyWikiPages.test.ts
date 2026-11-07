import { fetchEnemyWikiPages } from "#src/services/genshinAssets/enemies/fetchEnemyWikiPages";
import { toWikiPageCachePath } from "#src/services/genshinAssets/enemies/toWikiPageCachePath";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(fetchEnemyWikiPages, () => {
  let cacheDirectory: string;

  beforeEach(async () => {
    cacheDirectory = await mkdtemp(join(tmpdir(), "enemy-wiki-pages-"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(cacheDirectory, { force: true, recursive: true });
  });

  test("A cached enemy page is not fetched again", async () => {
    expect.hasAssertions();
    const titles = ["Automatons", "Hilichurls"];
    const createPageResponse = (title: null | string) => ({
      batchcomplete: true,
      query: { pages: [{ ns: 0, pageid: 1, revisions: [{ slots: { main: { content: "" } } }], title }] },
    });
    const titleOf = (input: unknown) => new URL(String(input)).searchParams.get("titles");
    const cachedPath = toWikiPageCachePath(cacheDirectory, "Automatons");
    const cachedJson = JSON.stringify(createPageResponse("Automatons"));
    await writeFile(cachedPath, cachedJson);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) => Response.json(createPageResponse(titleOf(input))));

    await fetchEnemyWikiPages(titles, false, cacheDirectory);

    expect(fetchSpy.mock.calls.map(([input]) => titleOf(input))).toStrictEqual(["Hilichurls"]);
    expect(await readFile(cachedPath, "utf8")).toBe(cachedJson);
  });
});
