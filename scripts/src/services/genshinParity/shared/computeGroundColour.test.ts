import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { computeGroundColour } from "#src/services/genshinParity/shared/computeGroundColour";
import { describe, expect, test } from "vitest";

describe(computeGroundColour, () => {
  test("takes the median of the pixels outside every hole, channel by channel", () => {
    expect.hasAssertions();

    const ink = [240, 250, 250];
    const low = [100, 100, 100];
    const middle = [120, 130, 140];
    const high = [200, 210, 220];
    const data = Uint8Array.from([ink, ink, low, middle, high].flat());
    const hole: ImageRegion = { height: 1, width: 2, x: 0, y: 0 };

    expect(computeGroundColour(data, 3, data.length / 3, 1, [hole])).toStrictEqual(middle);
  });

  test("a glyph covering over half its box does not make its ink the ground", () => {
    expect.hasAssertions();

    const ink = [240, 250, 250];
    const terrain = [170, 210, 215];
    const data = Uint8Array.from([ink, ink, ink, terrain].flat());
    const hole: ImageRegion = { height: 1, width: 3, x: 0, y: 0 };

    expect(computeGroundColour(data, 3, data.length / 3, 1, [hole])).toStrictEqual(terrain);
  });

  test("with every pixel inside a hole, the ground is the median of the whole region", () => {
    expect.hasAssertions();

    const low = [100, 100, 100];
    const high = [200, 210, 220];
    const middle = [150, 160, 170];
    const data = Uint8Array.from([low, middle, high].flat());
    const hole: ImageRegion = { height: 1, width: 3, x: 0, y: 0 };

    expect(computeGroundColour(data, 3, data.length / 3, 1, [hole])).toStrictEqual(middle);
  });
});
