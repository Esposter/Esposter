import { ANIME_GAME_DATA_COMMIT } from "#src/services/genshinText/constants";
import { describe, expect, test } from "vitest";

describe("animeGameDataCommit", () => {
  test("a moved branch does not change a run", () => {
    expect.hasAssertions();

    // A branch can move, a commit cannot: the constant every request names must be a full commit SHA
    expect(ANIME_GAME_DATA_COMMIT).toMatch(/^[\da-f]{40}$/u);
  });
});
