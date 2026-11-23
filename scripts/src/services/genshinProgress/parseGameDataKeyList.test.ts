import { GAME_DATA_INDEX_KEYS_NAME, GAME_DATA_KEYS_NAME } from "#src/services/gameData/constants";
import { parseGameDataKeyList } from "#src/services/genshinProgress/parseGameDataKeyList";
import { renderConstant } from "#src/services/hostedAssets/renderConstant";
import { describe, expect, test } from "vitest";

describe(parseGameDataKeyList, () => {
  test("a key list reads every leaf of its two constants, nested or flat", () => {
    expect.hasAssertions();

    const text = [
      renderConstant(GAME_DATA_KEYS_NAME, [
        ["achievements/achievements", "achievements/achievements"],
        ["tips", "tips"],
      ]),
      "",
      renderConstant(GAME_DATA_INDEX_KEYS_NAME, [["domains", "domains"]]),
    ].join("\n");

    expect(parseGameDataKeyList(text)).toStrictEqual({
      indexes: ["domains"],
      objects: ["achievements/achievements", "tips"],
    });
  });
});
