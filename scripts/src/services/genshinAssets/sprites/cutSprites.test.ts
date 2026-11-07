import { cutSprites } from "#src/services/genshinAssets/sprites/cutSprites";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// The PNG encoder writes a grey atlas as three channels of the same value, so the first channel is the grey
const readGrey = async (path: string): Promise<number[]> => [...(await sharp(path).extractChannel(0).raw().toBuffer())];

describe(cutSprites, () => {
  // A 4 by 4 grey atlas whose pixel in column x of the row y, counted from its top, holds 10 * y + x
  const ATLAS_SIZE = 4;
  const ATLAS_PIXELS = Buffer.from(
    Array.from(
      { length: ATLAS_SIZE * ATLAS_SIZE },
      (_value, pixel) => 10 * Math.floor(pixel / ATLAS_SIZE) + (pixel % ATLAS_SIZE),
    ),
  );
  let directory = "";
  let atlasPath = "";

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "sprite-cut-"));
    atlasPath = join(directory, "atlas.png");
    await sharp(ATLAS_PIXELS, { raw: { channels: 1, height: ATLAS_SIZE, width: ATLAS_SIZE } })
      .png()
      .toFile(atlasPath);
  });

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  // Unity measures a rectangle up from the atlas's bottom edge, so the bottom row is y 0 and the top two rows are y 2 and 3
  test("cuts each rectangle measured up from the atlas's bottom edge, the rectangles of one atlas cut together", async () => {
    expect.hasAssertions();

    const bottomRow = join(directory, "bottom.png");
    const leftColumn = join(directory, "left.png");
    await cutSprites(atlasPath, [
      { outputPath: bottomRow, rectangle: { height: 1, width: 2, x: 1, y: 0 } },
      { outputPath: leftColumn, rectangle: { height: 2, width: 1, x: 0, y: 2 } },
    ]);

    expect(await readGrey(bottomRow)).toStrictEqual([31, 32]);
    expect(await readGrey(leftColumn)).toStrictEqual([0, 10]);
  });
});
