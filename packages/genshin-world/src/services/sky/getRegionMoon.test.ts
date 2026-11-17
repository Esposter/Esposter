import { RegionId } from "#src/models/shared/RegionId";
import { getRegionMoon } from "#src/services/sky/getRegionMoon";
import { DEFAULT_SKY_SHAPE } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(getRegionMoon, () => {
  test("other regions keep the standard moon", () => {
    expect.hasAssertions();

    expect(getRegionMoon(RegionId.Mondstadt)).toStrictEqual({ brightness: 1, size: DEFAULT_SKY_SHAPE.moonSize });
  });
});
