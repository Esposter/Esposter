import { getDeviceLabel } from "@/services/auth/getDeviceLabel";
import { describe, expect, test } from "vitest";

describe(getDeviceLabel, () => {
  // Ordering is the whole behaviour: Edge and Opera both claim Chrome and Chrome claims Safari, so a first-match
  // Parse names the wrong browser. The rest are the halves a label falls back to when only one is recognised
  test.each([
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      "Edge on Windows",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Chrome on macOS",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      "Safari on iPhone",
    ],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Windows"],
    ["Firefox/143.0", "Firefox"],
    ["curl/8.7.1", "Unknown device"],
    ["", "Unknown device"],
  ])("reads %# as its most specific claim", (userAgent, label) => {
    expect.hasAssertions();

    expect(getDeviceLabel(userAgent)).toBe(label);
  });
});
