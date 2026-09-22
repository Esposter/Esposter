import { LORE_EVEN_SHARE } from "#src/services/constants";
import { drawLoreChoice } from "#src/services/drawLoreChoice";
import { describe, expect, test } from "vitest";

describe(drawLoreChoice, () => {
  const names = ["a", "b"];

  test("follows the tier's odds", () => {
    expect.hasAssertions();

    expect(drawLoreChoice({ a: 1, b: 0 }, names, 0)).toBe("a");
  });

  test("reaches a character the tier gave no odds through the even share", () => {
    expect.hasAssertions();

    expect(drawLoreChoice({ a: 1, b: 0 }, names, 1 - LORE_EVEN_SHARE / names.length)).toBe("b");
  });

  test("draws evenly with no odds to lean on", () => {
    expect.hasAssertions();

    expect(drawLoreChoice({}, names, 0.5)).toBe("b");
  });
});
