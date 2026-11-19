import { DEFAULT_PARITY_DIRECTORY } from "#src/services/fleet/data/constants";
import { TOOLS_DIRECTORY } from "#src/services/recreation/animeStudio/constants";
import { CACHE_ROOT, CONTENT_CACHE_DIRECTORY, DATA_ROOT } from "@esposter/shared-node/cache";
import { relative } from "node:path";
import { describe, expect, test } from "vitest";

describe("dataRoot", () => {
  // The tools and the fleet's parity folder are kept under the data root, and the content cache under the cache root,
  // So a machine's paths never restate the home folder. A folder that stood apart from its root would show as a path
  // That climbs out of it. The parity folder's own default is not read here, since `GENSHIN_PARITY_DIRECTORY` moves it
  // Per machine; the fleet's default is the env-free one
  test("every machine folder derives from its root", () => {
    expect.hasAssertions();

    expect([
      relative(DATA_ROOT, TOOLS_DIRECTORY),
      relative(DATA_ROOT, DEFAULT_PARITY_DIRECTORY),
      relative(CACHE_ROOT, CONTENT_CACHE_DIRECTORY),
    ]).toStrictEqual(["tools", "genshin-parity", "content"]);
  });
});
