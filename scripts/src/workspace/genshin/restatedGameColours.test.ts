import { readRestatedGameColourFindings } from "#src/services/sweeps/restatedGameColours/readRestatedGameColourFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * The interface library's public colours — the game's white and cream — are constants a `.vue` style block reads with
 * `v-bind`, so one edit moves every screen that wears them. A review had found the cream's literal in eighteen files
 * and the white's in six, and nothing else sees it: the literal draws exactly the colour the constant does, so no
 * screenshot, type or unit test differs.
 */
describe("restatedGameColours", () => {
  test("no Genshin component writes a public game colour as its literal", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(readRestatedGameColourFindings()).toStrictEqual([]);
  });
});
