import { VideoSite } from "#src/models/genshinParity/VideoSite";
import { getSearchArguments } from "#src/services/genshinParity/shared/getSearchArguments";
import { describe, expect, test } from "vitest";

describe(getSearchArguments, () => {
  test("searches YouTube for the count of results, with the full JSON and nothing downloaded", () => {
    expect.hasAssertions();

    expect(getSearchArguments(VideoSite.Youtube, 10, "pick up items")).toStrictEqual([
      "--dump-json",
      "--skip-download",
      "--no-warnings",
      "ytsearch10:pick up items",
    ]);
  });

  test("searches Bilibili with its own prefix", () => {
    expect.hasAssertions();

    expect(getSearchArguments(VideoSite.Bilibili, 3, "pick up items")).toStrictEqual([
      "--dump-json",
      "--skip-download",
      "--no-warnings",
      "bilisearch3:pick up items",
    ]);
  });

  test("refuses a count that is not a positive whole number", () => {
    expect.hasAssertions();

    expect(() => getSearchArguments(VideoSite.Youtube, 0, "pick up items")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: pick up items, has no count of 0]`,
    );
  });
});
