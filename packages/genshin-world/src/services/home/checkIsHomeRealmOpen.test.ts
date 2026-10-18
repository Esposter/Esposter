import { checkIsHomeRealmOpen } from "#src/services/home/checkIsHomeRealmOpen";
import { describe, expect, test } from "vitest";

describe(checkIsHomeRealmOpen, () => {
  test("the pot opens the realm at Adventure Rank 28", () => {
    expect.hasAssertions();

    expect(checkIsHomeRealmOpen(28)).toBe(true);
  });

  test("the pot does not open the realm below Adventure Rank 28", () => {
    expect.hasAssertions();

    expect(checkIsHomeRealmOpen(27)).toBe(false);
  });
});
