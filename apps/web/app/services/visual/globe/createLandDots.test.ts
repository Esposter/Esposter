import type { LandMask } from "#src/models/visual/LandMask";

import { createLandDots } from "#src/services/visual/globe/createLandDots";
import { describe, expect, test } from "vitest";

describe(createLandDots, () => {
  // One cell per degree, with land only in the square from 0 to 1 degree north and east
  const landMask: LandMask = {
    cellsPerDegree: 1,
    rows: Array.from({ length: 180 }, (_value, i) => (i === 89 ? [180, 181] : [])),
  };

  test("dots stand on land only", () => {
    expect.hasAssertions();

    expect(createLandDots(landMask, 0.25)).toMatchInlineSnapshot(`
      [
        {
          "lat": 0.125,
          "lng": 0.125,
        },
        {
          "lat": 0.125,
          "lng": 0.375,
        },
        {
          "lat": 0.125,
          "lng": 0.625,
        },
        {
          "lat": 0.125,
          "lng": 0.875,
        },
        {
          "lat": 0.375,
          "lng": 0.125,
        },
        {
          "lat": 0.375,
          "lng": 0.375,
        },
        {
          "lat": 0.375,
          "lng": 0.625,
        },
        {
          "lat": 0.375,
          "lng": 0.875,
        },
        {
          "lat": 0.625,
          "lng": 0.125,
        },
        {
          "lat": 0.625,
          "lng": 0.375,
        },
        {
          "lat": 0.625,
          "lng": 0.625,
        },
        {
          "lat": 0.625,
          "lng": 0.875,
        },
        {
          "lat": 0.875,
          "lng": 0.125,
        },
        {
          "lat": 0.875,
          "lng": 0.375,
        },
        {
          "lat": 0.875,
          "lng": 0.625,
        },
        {
          "lat": 0.875,
          "lng": 0.875,
        },
      ]
    `);
  });

  test("a wider spacing draws fewer dots", () => {
    expect.hasAssertions();

    expect(createLandDots(landMask, 0.5)).toHaveLength(4);
    expect(createLandDots(landMask, 0.25)).toHaveLength(16);
  });
});
