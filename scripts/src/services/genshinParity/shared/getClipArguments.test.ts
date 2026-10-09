import { CAPTURES_DIRECTORY, FFMPEG_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getClipArguments } from "#src/services/genshinParity/shared/getClipArguments";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(getClipArguments, () => {
  const url = "https://www.youtube.com/watch?v=abcdefghijk";
  const ffmpegPath = join(FFMPEG_DIRECTORY, "ffmpeg.exe");

  test("downloads only the section, at the best MP4 up to 1080 high, merged by the given FFmpeg into captures", () => {
    expect.hasAssertions();

    expect(getClipArguments(url, 60, 75.5, "login", ffmpegPath)).toStrictEqual([
      "--no-playlist",
      "--no-simulate",
      "--print",
      "after_move:filepath",
      "--download-sections",
      "*60-75.5",
      "--format",
      "bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4][height<=1080]",
      "--merge-output-format",
      "mp4",
      "--ffmpeg-location",
      ffmpegPath,
      "--output",
      join(CAPTURES_DIRECTORY, "yt-%(id)s-login.%(ext)s"),
      url,
    ]);
  });

  test("leaves the FFmpeg on the PATH for yt-dlp to find, since it reads a location only as a path", () => {
    expect.hasAssertions();

    expect(getClipArguments(url, 60, 75.5, "login", "ffmpeg")).not.toContain("--ffmpeg-location");
  });

  test("refuses a section that does not end after it starts", () => {
    expect.hasAssertions();

    expect(() => getClipArguments(url, 60, 60, "login", ffmpegPath)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://www.youtube.com/watch?v=abcdefghijk, has no section from 60 to 60]`,
    );
  });

  test("refuses a section that starts before the video", () => {
    expect.hasAssertions();

    expect(() => getClipArguments(url, -1, 10, "login", ffmpegPath)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://www.youtube.com/watch?v=abcdefghijk, has no section from -1 to 10]`,
    );
  });

  test("refuses a name that is a path", () => {
    expect.hasAssertions();

    expect(() => getClipArguments(url, 0, 10, "../login", ffmpegPath)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: ../login, is not a clip name]`,
    );
  });
});
