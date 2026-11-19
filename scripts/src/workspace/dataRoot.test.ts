import { DEFAULT_PARITY_DIRECTORY } from "#src/services/fleet/data/constants";
import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { TOOLS_DIRECTORY } from "#src/services/recreation/animeStudio/constants";
import { CACHE_ROOT, DATA_ROOT } from "@esposter/shared-node/cache";
import { relative } from "node:path";
import { describe, expect, test } from "vitest";

describe("dataRoot", () => {
  // The cache, parity, tools and fleet folders are each written under the one data root, so a machine's paths never
  // Restate the home folder. The four roots are read beside the data root they derive from, and a root that stood
  // Apart from it would show as a path that climbs out of it
  test("every machine root derives from one data root", () => {
    expect.hasAssertions();

    expect(
      [CACHE_ROOT, PARITY_DIRECTORY, TOOLS_DIRECTORY, DEFAULT_PARITY_DIRECTORY].map((root) =>
        relative(DATA_ROOT, root),
      ),
    ).toStrictEqual(["cache", "genshin-parity", "tools", "genshin-parity"]);
  });
});
