import { ChestSeal } from "#src/models/chest/ChestSeal";
import { Element } from "#src/models/Element";
import { checkIsSealFreed } from "#src/services/chest/checkIsSealFreed";
import { describe, expect, test } from "vitest";

describe(checkIsSealFreed, () => {
  test("a chest sealed in vines is freed by Pyro", () => {
    expect.hasAssertions();

    expect(checkIsSealFreed(ChestSeal.Vines, { element: Element.Pyro, poiseDamage: 0 })).toBe(true);
  });

  test("a chest sealed in rock is freed by a blunt attack", () => {
    expect.hasAssertions();

    expect(checkIsSealFreed(ChestSeal.Rock, { isBlunt: true, poiseDamage: 0 })).toBe(true);
  });

  test("a chest sealed in vines is not freed by an attack of another element", () => {
    expect.hasAssertions();

    expect(checkIsSealFreed(ChestSeal.Vines, { element: Element.Hydro, poiseDamage: 0 })).toBe(false);
  });
});
