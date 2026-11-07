import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

import { fitPictureColour } from "#src/services/genshinAssets/colours/fitPictureColour";
import { MAIN_COLOUR_PROPERTY } from "#src/services/genshinAssets/shared/constants";
import { describe, expect, test } from "vitest";

describe(fitPictureColour, () => {
  // Two visible texels, red-brown and blue-brown, and a transparent one whose colour no picture shows
  const FIXTURE_TEXTURE: Texture = {
    data: Buffer.from([200, 100, 0, 255, 0, 100, 200, 255, 9, 9, 9, 0]),
    info: { channels: 4, height: 1, width: 3 },
  };
  const HALF_MAIN_COLOUR: MaterialValues = {
    colors: { [MAIN_COLOUR_PROPERTY]: [0.5, 0.5, 0.5, 1] },
    floats: {},
    keywords: [],
    name: "CardArt",
    shaderPathId: "1",
    textures: {},
  };

  test("A card plate takes its art's measured colour", () => {
    expect.hasAssertions();

    expect(fitPictureColour(FIXTURE_TEXTURE)).toStrictEqual([100, 100, 100]);
    // Under the half main colour the art's texels are tinted in linear light first: 200 to 146 and 100 to 71, so the mean
    // of the two visible texels is 73, 71 and 73
    expect(fitPictureColour(FIXTURE_TEXTURE, HALF_MAIN_COLOUR)).toStrictEqual([73, 71, 73]);
  });
});
