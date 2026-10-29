import { VideoSite } from "#src/models/recreation/video/VideoSite";
import { createPublicRecordingRow } from "#src/services/genshinParity/reference/createPublicRecordingRow";
import { describe, expect, test } from "vitest";

describe(createPublicRecordingRow, () => {
  const sha256 = "a".repeat(64);

  test("names a YouTube recording's public url by its id, with no range", () => {
    expect.hasAssertions();

    expect(
      createPublicRecordingRow({
        bytes: 3,
        id: "abcdefghijk",
        name: "yt-abcdefghijk-expedition-screen.mp4",
        sha256,
        site: VideoSite.Youtube,
        sourceFormat: "mp4",
      }),
    ).toStrictEqual({
      attribution: {},
      bytes: 3,
      name: "yt-abcdefghijk-expedition-screen.mp4",
      sha256,
      source: "https://www.youtube.com/watch?v=abcdefghijk",
      sourceFormat: "mp4",
    });
  });

  test("names a Bilibili recording's public page by its id, av or BV alike", () => {
    expect.hasAssertions();

    expect(
      createPublicRecordingRow({
        bytes: 3,
        id: "BV1xx411c7mD",
        name: "bili-BV1xx411c7mD-world.mkv",
        sha256,
        site: VideoSite.Bilibili,
        sourceFormat: "mkv",
      }).source,
    ).toBe("https://www.bilibili.com/video/BV1xx411c7mD");
  });
});
