import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { readFrameRows } from "#src/services/genshinParity/frames/readFrameRows";
import { RGB_CHANNEL_COUNT } from "#src/services/genshinParity/probe/constants";
import { describe, expect, test } from "vitest";

describe(readFrameRows, () => {
  test("a rectangle is read in every frame of a clip", async () => {
    expect.hasAssertions();

    const WIDTH = 4;
    const HEIGHT = 4;
    const BLACK = 0;
    const WHITE = 255;
    const SECONDS = [0, 0.1, 0.2];
    // The clip's bytes reach the reader in chunks that cut across its frames, as a pipe delivers them
    const CHUNK_BYTES = 7;
    // A frame is black, with the block painted white when one is given
    const createFrame = (block?: ImageRegion): Uint8Array => {
      const pixels = new Uint8Array(WIDTH * HEIGHT * RGB_CHANNEL_COUNT).fill(BLACK);
      if (block)
        for (let row = block.y; row < block.y + block.height; row++)
          for (let column = block.x; column < block.x + block.width; column++) {
            const offset = (row * WIDTH + column) * RGB_CHANNEL_COUNT;
            pixels.fill(WHITE, offset, offset + RGB_CHANNEL_COUNT);
          }
      return pixels;
    };
    const clip = Buffer.concat([
      createFrame(),
      createFrame({ height: 2, width: 2, x: 1, y: 1 }),
      createFrame({ height: 1, width: 1, x: 3, y: 0 }),
    ]);
    const chunks: Uint8Array[] = [];
    for (let offset = 0; offset < clip.length; offset += CHUNK_BYTES)
      chunks.push(clip.subarray(offset, offset + CHUNK_BYTES));

    const rows = await readFrameRows(chunks, WIDTH, HEIGHT, SECONDS);

    expect(rows).toStrictEqual([
      { index: 0, ink: 0, mean: [0, 0, 0], seconds: 0 },
      { box: { height: 2, width: 2, x: 1, y: 1 }, index: 1, ink: 1530, mean: [64, 64, 64], seconds: 0.1 },
      { box: { height: 1, width: 1, x: 3, y: 0 }, index: 2, ink: 478, mean: [16, 16, 16], seconds: 0.2 },
    ]);
  });
});
