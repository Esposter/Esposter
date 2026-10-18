import { buildLeyLineRegions } from "#src/services/genshinAssets/leyLine/buildLeyLineRegions";
import { describe, expect, test } from "vitest";

describe(buildLeyLineRegions, () => {
  test("each city's region is one record under its key", () => {
    expect.hasAssertions();

    const region = { kinds: [], places: [], sectionIds: [] };
    expect(buildLeyLineRegions(new Map([[1, region]]))).toStrictEqual({ "leyLine/regions/1": region });
  });
});
