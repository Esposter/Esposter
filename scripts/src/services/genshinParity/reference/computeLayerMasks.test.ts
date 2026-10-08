import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";

import { computeLayerMasks } from "#src/services/genshinParity/reference/computeLayerMasks";
import { FRAME_LAYER, SKY_LAYER, STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { describe, expect, test } from "vitest";

describe(computeLayerMasks, () => {
  const frame = { height: 1, width: 2 };
  // A part of the one family over the frame's left pixel, none over its right
  const gbuffer: Pick<WitnessGbuffer, "families" | "height" | "part" | "width"> = {
    families: ["Towers"],
    height: frame.height,
    part: Float32Array.from([1, 0, 0, 0, 0, 0, 0, 0]),
    width: frame.width,
  };

  test("reads each pixel's family at its place in the frame", () => {
    expect.hasAssertions();

    expect(computeLayerMasks(gbuffer, { ...frame, x: 0, y: 0 }, frame, 1)).toStrictEqual([
      { name: FRAME_LAYER },
      {
        mask: Uint8Array.from({ length: STRUCTURE_WIDTH }, (_value, pixel) => Number(pixel < STRUCTURE_WIDTH / 2)),
        name: "Towers",
      },
      {
        mask: Uint8Array.from({ length: STRUCTURE_WIDTH }, (_value, pixel) => Number(pixel >= STRUCTURE_WIDTH / 2)),
        name: SKY_LAYER,
      },
    ]);
  });

  test("leaves out a family drawn only outside the region", () => {
    expect.hasAssertions();

    expect(computeLayerMasks(gbuffer, { height: 1, width: 1, x: 1, y: 0 }, frame, 1)).toStrictEqual([
      { name: FRAME_LAYER },
      { mask: new Uint8Array(STRUCTURE_WIDTH).fill(1), name: SKY_LAYER },
    ]);
  });
});
