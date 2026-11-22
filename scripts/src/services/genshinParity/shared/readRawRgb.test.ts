import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

describe(readRawRgb, () => {
  test("stretches the image to the size given and keeps only its red, green and blue bytes", async () => {
    expect.hasAssertions();

    const input = await sharp({
      create: { background: { alpha: 1, b: 3, g: 2, r: 1 }, channels: 4, height: 1, width: 1 },
    })
      .png()
      .toBuffer();

    await expect(readRawRgb(input, 2, 1)).resolves.toStrictEqual(Buffer.from([1, 2, 3, 1, 2, 3]));
  });
});
