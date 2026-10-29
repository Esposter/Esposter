import { GENSHIN_FLEET_AREA } from "#src/services/fleet/constants";
import { checkIsGenshinOnly } from "#src/services/setup/checkIsGenshinOnly";
import { describe, expect, test } from "vitest";

describe(checkIsGenshinOnly, () => {
  test.each([
    [[GENSHIN_FLEET_AREA], true],
    [[GENSHIN_FLEET_AREA, "city"], false],
    [["*"], false],
    [[], false],
  ])("lent %j is Genshin only: %s", (areas, isGenshinOnly) => {
    expect.hasAssertions();

    expect(checkIsGenshinOnly(areas)).toBe(isGenshinOnly);
  });
});
