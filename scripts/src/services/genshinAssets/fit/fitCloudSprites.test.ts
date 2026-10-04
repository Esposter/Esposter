import { fitCloudSprites } from "#src/services/genshinAssets/fit/fitCloudSprites";
import { CLOUD_ATLAS_COLUMNS, CLOUD_ATLAS_ROWS } from "#src/services/genshinAssets/shared/constants";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

// The lowest and highest y a sprite's loops reach
const toBounds = (loops: [number, number][][]): number[] => {
  const points = loops.flat();
  return [Math.min(...points.map(([, y]) => y)), Math.max(...points.map(([, y]) => y))];
};

describe(fitCloudSprites, () => {
  const cellSize = 64;

  test("traces a cell's cloud by its alpha and its crown by its red, in the cell's unit square", async () => {
    expect.hasAssertions();

    const width = cellSize * CLOUD_ATLAS_COLUMNS;
    const height = cellSize * CLOUD_ATLAS_ROWS;
    const data = Buffer.alloc(width * height * 4);
    // The first cell covered whole, its upper half lit
    for (let y = 0; y < cellSize; y++)
      for (let x = 0; x < cellSize; x++) {
        const texel = (y * width + x) * 4;
        data[texel] = y < cellSize / 2 ? 255 : 0;
        data[texel + 3] = 255;
      }
    const atlas = await sharp(data, { raw: { channels: 4, height, width } })
      .png()
      .toBuffer();
    const { sprites } = await fitCloudSprites(atlas);

    expect(sprites).toHaveLength(1);
    expect(toBounds(sprites[0]?.outline ?? [])).toStrictEqual([0, 1]);
    expect(toBounds(sprites[0]?.lit ?? [])).toStrictEqual([0.5, 1]);
  });
});
