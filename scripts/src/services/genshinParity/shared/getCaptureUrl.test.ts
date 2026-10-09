import { getCaptureUrl } from "#src/services/genshinParity/shared/getCaptureUrl";
import { describe, expect, test } from "vitest";

describe(getCaptureUrl, () => {
  test.each([
    { capture: "yt-abcdefghijk-login.mp4", url: "https://www.youtube.com/watch?v=abcdefghijk" },
    { capture: "yt-abcdefghijk.mp4", url: "https://www.youtube.com/watch?v=abcdefghijk" },
    { capture: "recording.mkv", url: undefined },
  ])("reads $capture as $url", ({ capture, url }) => {
    expect.hasAssertions();

    expect(getCaptureUrl(capture)).toBe(url);
  });
});
