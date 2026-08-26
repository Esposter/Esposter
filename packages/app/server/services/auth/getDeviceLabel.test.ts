import { getDeviceLabel } from "@@/server/services/auth/getDeviceLabel";
import { describe, expect, test } from "vitest";

describe(getDeviceLabel, () => {
  // The label is a browser and the most specific device the agent string actually knows. What it withholds is
  // The other half of the behaviour: an OS version the string cannot be trusted on, and a browser name bowser's
  // Catch-all matcher invented rather than recognised
  test.each([
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      "Microsoft Edge 141 on Windows",
    ],
    // Windows 11 sends `NT 10.0` and macOS is frozen at `10_15_7`, so neither row states an OS version
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Chrome 141 on macOS",
    ],
    // Apple is the one vendor still publishing a model, so it wins over the OS name
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      "Safari 18 on iPhone",
    ],
    // Chrome froze the Android model to `K`, so the OS name is genuinely all that is left to say
    [
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
      "Chrome 141 on Android",
    ],
    // A real model in the string still does not reach the label — bowser reads the browser here, not the device
    [
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
      "Samsung Internet for Android 25 on Android",
    ],
    // `Mozilla` is what the catch-all matcher makes of a string with no browser in it, and is not a browser
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Windows"],
    ["Firefox/143.0", "Firefox 143"],
    ["curl/8.7.1", "Unknown device"],
    ["", "Unknown device"],
  ])("reads %# as the most specific device the string knows", (userAgent, label) => {
    expect.hasAssertions();

    expect(getDeviceLabel(userAgent)).toBe(label);
  });
});
