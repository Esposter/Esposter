import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { findAreaAt } from "#src/services/map/findAreaAt";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { describe, expect, test } from "vitest";

const catalogue = await readCatalogue(GAME_DATA_LOCAL_BASE_URL);

describe(findAreaAt, () => {
  test("names the area whose outline holds the point, as the region tag does for the character's place", () => {
    expect.hasAssertions();

    // The map fixture's player, which stands in the Sea of Clouds area where Jueyun Karst lies
    expect(findAreaAt(catalogue, -2390, -1560)?.name).toBe("Sea of Clouds");
  });

  test("names no area for a point past every outline", () => {
    expect.hasAssertions();

    expect(findAreaAt(catalogue, 1e6, 1e6)).toBeUndefined();
  });
});
