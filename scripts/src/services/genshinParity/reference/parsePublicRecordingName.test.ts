import { VideoSite } from "#src/models/recreation/video/VideoSite";
import { parsePublicRecordingName } from "#src/services/genshinParity/reference/parsePublicRecordingName";
import { describe, expect, test } from "vitest";

describe(parsePublicRecordingName, () => {
  test("reads a YouTube recording's id and clip name from its file name", () => {
    expect.hasAssertions();

    expect(parsePublicRecordingName("yt-abcdefghijk-expedition-screen.mp4")).toStrictEqual({
      id: "abcdefghijk",
      name: "expedition-screen",
      site: VideoSite.Youtube,
    });
  });

  test("keeps a clip name that repeats the id, which the clip tool writes as it is given", () => {
    expect.hasAssertions();

    expect(parsePublicRecordingName("yt-abcdefghijk-yt-abcdefghijk-start.mp4")).toStrictEqual({
      id: "abcdefghijk",
      name: "yt-abcdefghijk-start",
      site: VideoSite.Youtube,
    });
  });

  test("reads a Bilibili recording's id, av or BV, from its file name", () => {
    expect.hasAssertions();

    expect(parsePublicRecordingName("bili-BV1xx411c7mD-world.mkv")).toStrictEqual({
      id: "BV1xx411c7mD",
      name: "world",
      site: VideoSite.Bilibili,
    });
  });

  test("refuses a file name with no clip name, a yt-dlp format part or a user's capture", () => {
    expect.hasAssertions();

    expect(parsePublicRecordingName("yt-abcdefghijk.mp4")).toBeUndefined();
    expect(parsePublicRecordingName("yt-abcdefghijk.f137.mp4")).toBeUndefined();
    expect(parsePublicRecordingName("bili-av532052219.mp4")).toBeUndefined();
    expect(parsePublicRecordingName("world-hud.mkv")).toBeUndefined();
  });

  test("refuses a Bilibili id under the yt prefix, which the clip tool writes for a Bilibili URL", () => {
    expect.hasAssertions();

    expect(parsePublicRecordingName("yt-av532052219-clip.mp4")).toBeUndefined();
  });
});
