import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { CHANNELS } from "#src/services/recreation/image/constants";
import { fillRegionHarmonically } from "#src/services/recreation/image/fillRegionHarmonically";
import { describe, expect, test } from "vitest";

describe(fillRegionHarmonically, () => {
  const OPAQUE = 255;
  const INTERFACE_COLOUR = [0, 0, 0, OPAQUE];
  const FRAME_WIDTH = 10;
  const FRAME_HEIGHT = 8;
  const NO_REGION = { height: 0, width: 0, x: 0, y: 0 };
  const getGradientColour = (column: number, row: number) => [2 * column + 3, row + 40, 100 - column, OPAQUE];
  // A frame's pixels, each its colour at its own column and row, the region's own pixels set to the interface's colour
  const createFrame = (
    width: number,
    height: number,
    region: ImageRegion,
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

    const region = { height: 3, width: 4, x: 3, y: 2 };

    expect(
      fillRegionHarmonically(
        createFrame(FRAME_WIDTH, FRAME_HEIGHT, region, () => flatColour),
        FRAME_WIDTH,
        FRAME_HEIGHT,
        region,
      ),
    ).toStrictEqual(createFrame(FRAME_WIDTH, FRAME_HEIGHT, NO_REGION, () => flatColour));
  });

  test("fills a region along a linear gradient with the gradient, leaving the rest of the frame as it was", () => {
    expect.hasAssertions();

    const width = 40;
    const height = 30;
    const region = { height: 12, width: 16, x: 12, y: 9 };

    expect(
      fillRegionHarmonically(createFrame(width, height, region, getGradientColour), width, height, region),
    ).toStrictEqual(createFrame(width, height, NO_REGION, getGradientColour));
  });

  test("fills a region on the frame's left edge from the border it has", () => {
    expect.hasAssertions();

    const region = { height: 3, width: 4, x: 0, y: 2 };

    expect(
      fillRegionHarmonically(
        createFrame(FRAME_WIDTH, FRAME_HEIGHT, region, () => flatColour),
        FRAME_WIDTH,
        FRAME_HEIGHT,
        region,
      ),
    ).toStrictEqual(createFrame(FRAME_WIDTH, FRAME_HEIGHT, NO_REGION, () => flatColour));
  });
});
