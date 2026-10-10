import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import { tintTexture } from "#src/services/genshinAssets/fit/tintTexture";
import { describe, expect, test } from "vitest";

describe(tintTexture, () => {
  test("multiplies each texel in linear light, its alpha kept", () => {
    expect.hasAssertions();

    const texture: Texture = { data: Buffer.from([255, 128, 0, 7]), info: { channels: 4, height: 1, width: 1 } };

    expect(tintTexture(texture, [1, 0.5, 0.5])).toStrictEqual({
      data: Buffer.from([255, 92, 0, 7]),
      info: { channels: 4, height: 1, width: 1 },
    });
  });

  test("widens a grey texture to three channels under a coloured tint", () => {
    expect.hasAssertions();

    const texture: Texture = { data: Buffer.from([255, 7]), info: { channels: 2, height: 1, width: 1 } };

    expect(tintTexture(texture, [1, 0.5, 0])).toStrictEqual({
      data: Buffer.from([255, 188, 0, 7]),
      info: { channels: 4, height: 1, width: 1 },
    });
  });
});
