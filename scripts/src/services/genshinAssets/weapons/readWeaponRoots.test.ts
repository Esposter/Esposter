import { readWeaponRoots } from "#src/services/genshinAssets/weapons/readWeaponRoots";
import { describe, expect, test } from "vitest";

describe(readWeaponRoots, () => {
  test("the committed weapon roots parse and are not empty", () => {
    expect.hasAssertions();

    expect(readWeaponRoots().length).toBeGreaterThan(0);
  });
});
