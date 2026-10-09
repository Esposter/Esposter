import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import { sampleSurfaceTexture } from "#src/services/genshinAssets/fit/sampleSurfaceTexture";
import { describe, expect, test } from "vitest";

describe(sampleSurfaceTexture, () => {
  test("reads the texel a UV falls on, its alpha as how far it is covered", () => {
    expect.hasAssertions();

    // One row of an opaque red texel and a transparent green one
    const texture: Texture = {
      data: Buffer.from([255, 0, 0, 255, 0, 255, 0, 0]),
      info: { channels: 4, height: 1, width: 2 },
    };

    expect(sampleSurfaceTexture(texture, [0.25, 0.5])).toStrictEqual({ colour: [255, 0, 0], coverage: 1 });
    expect(sampleSurfaceTexture(texture, [0.75, 0.5])).toStrictEqual({ colour: [0, 255, 0], coverage: 0 });
  });

  test("covers a texture with no alpha in full, and paints one channel grey", () => {
    expect.hasAssertions();

    const texture: Texture = { data: Buffer.from([10, 20, 30]), info: { channels: 3, height: 1, width: 1 } };
    const grey: Texture = { data: Buffer.from([7]), info: { channels: 1, height: 1, width: 1 } };

    expect(sampleSurfaceTexture(texture, [0.5, 0.5])).toStrictEqual({ colour: [10, 20, 30], coverage: 1 });
    expect(sampleSurfaceTexture(grey, [0.5, 0.5])).toStrictEqual({ colour: [7, 7, 7], coverage: 1 });
  });
});
