import { VideoSite } from "#src/models/recreation/video/VideoSite";
import { getSearchArguments } from "#src/services/recreation/video/getSearchArguments";
import { describe, expect, test } from "vitest";

describe(getSearchArguments, () => {
  test("searches YouTube for the count of results, printing only the fields a candidate reads, nothing downloaded", () => {
    expect.hasAssertions();

    expect(getSearchArguments(VideoSite.Youtube, 10, "pick up items")).toStrictEqual([
      "--print",
      "%(.{webpage_url,title,uploader,duration,height,fps,upload_date,chapters})j",
      "--skip-download",
      "--no-warnings",
      "ytsearch10:pick up items",
    ]);
  });

  test("searches Bilibili with its own prefix", () => {
    expect.hasAssertions();

    expect(getSearchArguments(VideoSite.Bilibili, 3, "pick up items")).toStrictEqual([
      "--print",
      "%(.{webpage_url,title,uploader,duration,height,fps,upload_date,chapters})j",
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
