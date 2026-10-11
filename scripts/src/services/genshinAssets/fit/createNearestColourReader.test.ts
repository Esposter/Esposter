import type { Vector } from "#src/models/shared/Vector";

import { createNearestColourReader } from "#src/services/genshinAssets/fit/createNearestColourReader";
import { describe, expect, test } from "vitest";

describe(createNearestColourReader, () => {
  // A black point in the five-centimetre cell the query stands in, a white one just past it in the next, and a red one
  // Far off
  const POINTS: Vector[] = [
    [0.001, 0, 0],
    [0.051, 0, 0],
    [1, 0, 0],
  ];
  const COLOURS: Vector[] = [
    [0, 0, 0],
    [1, 1, 1],
    [1, 0, 0],
  ];
  const QUERY: Vector = [0.049, 0, 0];

  test("reads the nearest point in the next cell over a farther one in its own", () => {
    expect.hasAssertions();

    expect(createNearestColourReader(POINTS, COLOURS, 1)(QUERY)).toBe(0xffffff);
  });

  test("reads the mean of the nearest points in linear light, packed as sRGB", () => {
    expect.hasAssertions();

    // Half white in linear light is 188 of 255 in sRGB
    expect(createNearestColourReader(POINTS, COLOURS, 2)(QUERY)).toBe(0xbcbcbc);
  });
});
