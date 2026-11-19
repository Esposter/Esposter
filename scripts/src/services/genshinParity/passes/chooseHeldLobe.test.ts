import { chooseHeldLobe } from "#src/services/genshinParity/passes/chooseHeldLobe";
import { describe, expect, test } from "vitest";

describe(chooseHeldLobe, () => {
  test("the lobe that holds across the most high-pass boxes is the map's, a lobe that moves with its box being the box's", () => {
    expect.hasAssertions();

    // The door's normal map: 13 texels at boxes of 4, 8 and 32, and a different lobe at each of the other boxes
    expect(chooseHeldLobe([13, 13, 39, 13, 96, 123])).toBe(13);
  });

  test("a tie between lobes that hold equally often goes to the shorter, the smaller box's", () => {
    expect.hasAssertions();

    expect(chooseHeldLobe([30, 20, 30, 20])).toBe(20);
  });

  test("a box that resolves no lobe holds none", () => {
    expect.hasAssertions();

    expect(chooseHeldLobe([undefined, 12, undefined, undefined])).toBe(12);
  });

  test("no box resolving a lobe reads none", () => {
    expect.hasAssertions();

    expect(chooseHeldLobe([undefined, undefined])).toBeUndefined();
  });
});
