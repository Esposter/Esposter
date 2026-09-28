import { getDeviceName } from "#src/services/device/getDeviceName";
import { describe, expect, test } from "vitest";

describe(getDeviceName, () => {
  test.each([
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
      "Edge on Windows",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      "Safari on macOS",
    ],
    ["Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0", "Firefox on Linux"],
    ["", "A browser"],
  ])("names %s %s", (userAgent, expected) => {
    expect.hasAssertions();

    expect(getDeviceName(userAgent)).toBe(expected);
  });
});
