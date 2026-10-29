import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

describe(readRawRgb, () => {
  test("stretches the image to the size given and keeps only its red, green and blue bytes", async () => {
    expect.hasAssertions();

    const input = await sharp({
      create: { background: { alpha: 1, b: 30, g: 20, r: 10 }, channels: 4, height: 1, width: 1 },
    })
      .png()
      .toBuffer();

    expect(await readRawRgb(input, 2, 1)).toStrictEqual(Buffer.from([10, 20, 30, 10, 20, 30]));
  });
});
