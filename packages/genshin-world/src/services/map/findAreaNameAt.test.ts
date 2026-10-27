import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { findAreaAt } from "#src/services/map/findAreaAt";
import { findAreaNameAt } from "#src/services/map/findAreaNameAt";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { describe, expect, test } from "vitest";

const catalogue = await readCatalogue(GAME_DATA_LOCAL_BASE_URL);

describe(findAreaNameAt, () => {
  test("entering an area shows its game name", () => {
    expect.hasAssertions();

    // The middle of Dawn Winery's outline, a city the game names in its own right inside Windwail Highland
    const area = findAreaAt(catalogue, -133, -854);

    expect(area && findAreaNameAt(area, -133, -854)).toBe("Dawn Winery");
  });

  test("windrise belongs to Galesong Hill", () => {
    expect.hasAssertions();

    // The great oak's place in the region data, inside Windrise, which the game files under Galesong Hill and not as a
    // City
    const area = findAreaAt(catalogue, 0, 0);

    expect(area && findAreaNameAt(area, 0, 0)).toBe("Galesong Hill");
  });
});
