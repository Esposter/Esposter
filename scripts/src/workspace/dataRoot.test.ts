import { DEFAULT_PARITY_DIRECTORY } from "#src/services/fleet/data/constants";
import { TOOLS_DIRECTORY } from "#src/services/recreation/animeStudio/constants";
import { CACHE_ROOT, DATA_ROOT } from "@esposter/shared-node/cache";
import { relative } from "node:path";
import { describe, expect, test } from "vitest";

describe("dataRoot", () => {
  // The cache, tools and fleet's parity folders are each written under the one data root, so a machine's paths never
  // Restate the home folder. The three roots are read beside the data root they derive from, and a root that stood
  // Apart from it would show as a path that climbs out of it. The parity folder's own default is not read here, since
  // `GENSHIN_PARITY_DIRECTORY` moves it per machine; the fleet's default is the env-free one
  test("every machine root derives from one data root", () => {
    expect.hasAssertions();

    expect(
      [CACHE_ROOT, TOOLS_DIRECTORY, DEFAULT_PARITY_DIRECTORY].map((root) => relative(DATA_ROOT, root)),
    ).toStrictEqual(["cache", "tools", "genshin-parity"]);
  });
});
