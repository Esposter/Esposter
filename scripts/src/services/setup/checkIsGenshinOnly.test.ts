import { checkIsGenshinOnly } from "#src/services/setup/checkIsGenshinOnly";
import { describe, expect, test } from "vitest";

describe(checkIsGenshinOnly, () => {
  test.each([
    [["genshin"], true],
    [["genshin", "city"], false],
    [["*"], false],
    [[], false],
  ])("lent %j is Genshin only: %s", (areas, isGenshinOnly) => {
    expect.hasAssertions();

    expect(checkIsGenshinOnly(areas)).toBe(isGenshinOnly);
  });
});
