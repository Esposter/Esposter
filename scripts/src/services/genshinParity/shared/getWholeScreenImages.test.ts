import type { WikiImagesResponse } from "#src/models/genshinParity/WikiImagesResponse";

import { getWholeScreenImages } from "#src/services/genshinParity/shared/getWholeScreenImages";
import { describe, expect, test } from "vitest";

const page = (title: string, width: number, height: number, url = `https://wiki/${title}`) => ({
  imageinfo: [{ height, url, width }],
  title,
});

describe(getWholeScreenImages, () => {
  test("keeps the images at least 1280 wide of a screen's shape, widest first", () => {
    expect.hasAssertions();

    const response: WikiImagesResponse = {
      query: {
        pages: {
          1: page("File:Small.png", 1024, 576),
          2: page("File:Narrow.png", 1280, 1000),
          3: page("File:Handbook.png", 3130, 1730, "https://wiki/handbook"),
          4: page("File:Menu.png", 2560, 1440),
          5: page("File:Portrait.png", 1440, 2560),
        },
      },
    };

    expect(getWholeScreenImages(response)).toStrictEqual([
      { height: 1730, title: "File:Handbook.png", url: "https://wiki/handbook", width: 3130 },
      { height: 1440, title: "File:Menu.png", url: "https://wiki/File:Menu.png", width: 2560 },
    ]);
  });

  test("keeps an image whose aspect ratio is exactly 1.6 or 1.9", () => {
    expect.hasAssertions();

    const response: WikiImagesResponse = {
      query: { pages: { 1: page("File:Sixteen.png", 1600, 1000), 2: page("File:Nineteen.png", 1900, 1000) } },
    };

    expect(getWholeScreenImages(response).map(({ title }) => title)).toStrictEqual([
      "File:Nineteen.png",
      "File:Sixteen.png",
    ]);
  });

  test("leaves out a page with no image info, no title, or no pages at all", () => {
    expect.hasAssertions();

    expect(
      getWholeScreenImages({
        query: {
          pages: { 1: { title: "File:Missing.png" }, 2: { imageinfo: [{ height: 1440, url: "u", width: 2560 }] } },
        },
      }),
    ).toStrictEqual([]);
    expect(getWholeScreenImages({})).toStrictEqual([]);
  });
});
