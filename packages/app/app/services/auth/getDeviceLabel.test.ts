import { getDeviceLabel } from "@/services/auth/getDeviceLabel";
import { describe, expect, test } from "vitest";

describe(getDeviceLabel, () => {
  test("reads the most specific claim in a user agent", () => {
    expect.hasAssertions();
    // Edge and Opera both claim Chrome, and Chrome claims Safari, so a first-match parse names the wrong browser
    expect(
      getDeviceLabel(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      ),
    ).toBe("Edge on Windows");
    expect(
      getDeviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      ),
    ).toBe("Chrome on macOS");
    expect(
      getDeviceLabel(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("Safari on iPhone");
  });

  test("falls back to whichever half it recognises", () => {
    expect.hasAssertions();
    expect(getDeviceLabel("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("Windows");
    expect(getDeviceLabel("Firefox/143.0")).toBe("Firefox");
    expect(getDeviceLabel("curl/8.7.1")).toBe("Unknown device");
    expect(getDeviceLabel("")).toBe("Unknown device");
  });
});
