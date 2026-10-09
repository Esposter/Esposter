import type { ParityRegion } from "#src/models/genshinParity/shared/ParityRegion";

import { fillRegionHarmonically } from "#src/services/genshinParity/reference/fillRegionHarmonically";
import { describe, expect, test } from "vitest";

describe(fillRegionHarmonically, () => {
  const CHANNELS = 4;
  const OPAQUE = 255;
  const INTERFACE_COLOUR = [0, 0, 0, OPAQUE];
  const getGradientColour = (column: number, row: number) => [2 * column + 3, row + 40, 100 - column, OPAQUE];
  // A frame's pixels, each its colour at its own column and row, the region's own pixels set to the interface's colour
  const getFrame = (
    width: number,
    height: number,
    region: ParityRegion,
    getColour: (column: number, row: number) => number[],
  ): Uint8Array => {
    const pixels = new Uint8Array(width * height * CHANNELS);
    for (let row = 0; row < height; row++)
      for (let column = 0; column < width; column++) {
        const isInside =
          column >= region.x && column < region.x + region.width && row >= region.y && row < region.y + region.height;
        pixels.set(isInside ? INTERFACE_COLOUR : getColour(column, row), (row * width + column) * CHANNELS);
      }
    return pixels;
  };

  const flatColour = [50, 120, 200, OPAQUE];

  test("fills a region surrounded by a flat border flat", () => {
    expect.hasAssertions();

    const width = 10;
    const height = 8;
    const region = { height: 3, width: 4, x: 3, y: 2 };

    expect(
      fillRegionHarmonically(
        getFrame(width, height, region, () => flatColour),
        width,
        height,
        region,
      ),
    ).toStrictEqual(getFrame(width, height, { height: 0, width: 0, x: 0, y: 0 }, () => flatColour));
  });

  test("fills a region along a linear gradient with the gradient, leaving the rest of the frame as it was", () => {
    expect.hasAssertions();

    const width = 40;
    const height = 30;
    const region = { height: 12, width: 16, x: 12, y: 9 };

    expect(
      fillRegionHarmonically(getFrame(width, height, region, getGradientColour), width, height, region),
    ).toStrictEqual(getFrame(width, height, { height: 0, width: 0, x: 0, y: 0 }, getGradientColour));
  });

  test("fills a region on the frame's left edge from the border it has", () => {
    expect.hasAssertions();

    const width = 10;
    const height = 8;
    const region = { height: 3, width: 4, x: 0, y: 2 };

    expect(
      fillRegionHarmonically(
        getFrame(width, height, region, () => flatColour),
        width,
        height,
        region,
      ),
    ).toStrictEqual(getFrame(width, height, { height: 0, width: 0, x: 0, y: 0 }, () => flatColour));
  });
});
