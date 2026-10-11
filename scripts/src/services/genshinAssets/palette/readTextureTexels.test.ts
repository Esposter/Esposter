import { readTextureTexels } from "#src/services/genshinAssets/palette/readTextureTexels";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readTextureTexels, () => {
  const size = 64;
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "texture-texels-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("reads only the texels its alpha covers", async () => {
    expect.hasAssertions();

    const data = Buffer.alloc(size * size * 4);
    // The left half opaque red, the right half transparent green
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const texel = (y * size + x) * 4;
        const isCovered = x < size / 2;
        data[texel] = isCovered ? 255 : 0;
        data[texel + 1] = isCovered ? 0 : 255;
        data[texel + 3] = isCovered ? 255 : 0;
      }
    const texturePath = join(directory, "texture.png");
    await sharp(data, { raw: { channels: 4, height: size, width: size } })
      .png()
      .toFile(texturePath);
    const texels = await readTextureTexels(texturePath);

    expect(texels).toHaveLength((size * size) / 2);
    expect(texels.every(([red, green]) => red === 1 && green === 0)).toBe(true);
  });
});
