import { formatWholeScreenLines } from "#src/services/genshinParity/shared/formatWholeScreenLines";
import { describe, expect, test } from "vitest";

describe(formatWholeScreenLines, () => {
  test("prints one line an image, its size, file title and URL", () => {
    expect.hasAssertions();

    expect(
      formatWholeScreenLines("Archive", [
        { height: 1440, title: "File:Archive Menu Home 1.png", url: "https://wiki/home", width: 2560 },
      ]),
    ).toStrictEqual(["2560x1440 File:Archive Menu Home 1.png https://wiki/home"]);
  });

  test("prints the article's title as having no whole-screen image when it has none", () => {
    expect.hasAssertions();

    expect(formatWholeScreenLines("Archive", [])).toStrictEqual(["Archive: no whole-screen image"]);
  });
});
