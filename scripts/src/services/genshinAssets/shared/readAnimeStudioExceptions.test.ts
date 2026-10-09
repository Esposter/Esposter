import { readAnimeStudioExceptions } from "#src/services/genshinAssets/shared/readAnimeStudioExceptions";
import { describe, expect, test } from "vitest";

describe(readAnimeStudioExceptions, () => {
  test("reads each line naming an exception and nothing else", () => {
    expect.hasAssertions();

    expect(
      readAnimeStudioExceptions(
        [
          "Loading 00/05054155.blk",
          "System.ArgumentOutOfRangeException: Index was out of range. (Parameter 'index')",
          "   at AnimeStudio.AssetsHelper.ProcessAssetData()",
          "Exported 14 assets",
        ].join("\n"),
      ),
    ).toStrictEqual(["System.ArgumentOutOfRangeException: Index was out of range. (Parameter 'index')"]);
  });

  test("reads none from a clean run", () => {
    expect.hasAssertions();

    expect(readAnimeStudioExceptions("Loading 00/05054155.blk\nExported 14 assets")).toStrictEqual([]);
  });
});
