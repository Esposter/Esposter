import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";

import { scoreLayers } from "#src/services/genshinParity/reference/scoreLayers";
import { scoreStructure } from "#src/services/genshinParity/reference/scoreStructure";
import { FRAME_LAYER, SKY_LAYER, STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { readFlipErrorMap } from "#src/services/genshinParity/shared/readFlipErrorMap";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

describe(scoreLayers, () => {
  const size = 2;
  const drawSquare = (background: string): Promise<Buffer> =>
    sharp({ create: { background, channels: 3, height: size, width: size } })
      .png()
      .toBuffer();

  test("scores the frame over the reference's region as its row does, and no family drawn outside it", async () => {
    expect.hasAssertions();

    const frame = { height: size, width: size * 2 };
    const pixelCount = frame.width * frame.height;
    // A part of the one family over the frame's left half, the region its right
    const gbuffer: WitnessGbuffer = {
      albedo: new Float32Array(pixelCount * 4),
      depth: new Float32Array(pixelCount * 4),
      families: ["Towers"],
      height: frame.height,
      normal: new Float32Array(pixelCount * 4),
      part: Float32Array.from({ length: pixelCount * 4 }, (_value, index) =>
        Number(index % 4 === 0 && Math.floor(index / 4) % frame.width < size),
      ),
      parts: [],
      width: frame.width,
    };
    const [reference, shot] = await Promise.all([drawSquare("#888"), drawSquare("#fff")]);
    const [layers, { mean: flip }, { edgeScore: shape, toneDifference: tone }] = await Promise.all([
      scoreLayers(reference, shot, gbuffer, { height: size, width: size, x: size, y: 0 }, frame),
      readFlipErrorMap(reference, shot, STRUCTURE_WIDTH, STRUCTURE_WIDTH),
      scoreStructure(reference, shot),
    ]);

    expect(layers.map(({ coverage, name }) => ({ coverage, name }))).toStrictEqual([
      { coverage: 1, name: FRAME_LAYER },
      { coverage: 1, name: SKY_LAYER },
    ]);
    // The frame's FLIP, summed in another order than its error map's own mean, to the report's four places
    expect(layers.map((layer) => [layer.shape, layer.tone, layer.flip.toFixed(4)])).toContainEqual([
      shape,
      tone,
      flip.toFixed(4),
    ]);
  });
});
