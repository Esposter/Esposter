import { familyLabelsCommand } from "#src/services/genshinAssets/commands/familyLabelsCommand";
import { readWikiPageContent } from "#src/services/genshinAssets/enemies/readWikiPageContent";
import { INTERACTIVE_MAP_ENEMY_CATEGORY_ID } from "#src/services/genshinAssets/points/constants";
import { readInteractiveMapLabels } from "#src/services/genshinAssets/points/readInteractiveMapLabels";
import { defineCommand, runCommand } from "citty";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/enemies/checkWikiPageCached"), () => ({
  checkWikiPageCached: vi.fn<() => boolean>(() => false),
}));
vi.mock(import("#src/services/genshinAssets/enemies/readWikiPageContent"), () => ({
  readWikiPageContent: vi.fn<() => string>(() => {
    throw new Error("a dry run read a family page the cache lacks");
  }),
}));
vi.mock(import("#src/services/genshinAssets/points/readInteractiveMapLabels"), () => ({
  readInteractiveMapLabels: vi.fn<typeof readInteractiveMapLabels>(() =>
    Promise.resolve([{ children: [], id: INTERACTIVE_MAP_ENEMY_CATEGORY_ID, name: "Enemies" }]),
  ),
}));

describe("familyLabelsCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // A dry run is how the map's rows are checked before a write, so a cache still lacking a family page lists it and stops
  test("a dry run against a cache lacking a family page lists it and writes nothing", async () => {
    expect.hasAssertions();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(defineCommand({ subCommands: { "family-labels": familyLabelsCommand } }), {
      rawArgs: ["family-labels", "--dry-run"],
    });

    expect(vi.mocked(readWikiPageContent)).not.toHaveBeenCalled();
    expect(vi.mocked(readInteractiveMapLabels)).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenLastCalledWith("the map is built once every family page is cached\nnothing written");
  });
});
