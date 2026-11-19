import { TEST_LAND_MASK } from "#src/services/visual/globe/constants.test";
import { createLandDots } from "#src/services/visual/globe/createLandDots";
import { describe, expect, test } from "vitest";

describe(createLandDots, () => {
  test("dots stand on land only", () => {
    expect.hasAssertions();

    expect(createLandDots(TEST_LAND_MASK, 0.25)).toMatchInlineSnapshot(`
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

    expect(createLandDots(TEST_LAND_MASK, 0.5)).toHaveLength(4);
    expect(createLandDots(TEST_LAND_MASK, 0.25)).toHaveLength(16);
  });
});
