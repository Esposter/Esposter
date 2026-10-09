import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { describe, expect, test } from "vitest";

describe(readCatalogue, () => {
  test("names every region the game ships, Mondstadt first", async () => {
    expect.hasAssertions();

    const catalogue = await readCatalogue(GAME_DATA_LOCAL_BASE_URL);

    expect(catalogue.regions.map(({ id }) => id)).toStrictEqual([
      "mondstadt",
      "liyue",
      "inazuma",
      "sumeru",
      "fontaine",
      "natlan",
      "nod-krai",
      "snezhnaya",
    ]);
  });
});
