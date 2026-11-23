import { checkAppManifestUrl } from "#shared/services/serviceWorker/checkAppManifestUrl";
import { ZERO_UUID } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(checkAppManifestUrl, () => {
  const ORIGIN = "https://dev.esposter.com";
  const OTHER_ORIGIN = "https://hosted.dev.esposter.com";

  test.each([
    [`/_nuxt/builds/meta/${ZERO_UUID}.json`, true],
    ["/_nuxt/builds/latest.json", true],
    ["/_nuxt/entry.js", false],
    [`/_nuxt/builds/meta/${ZERO_UUID}/extra.json`, false],
  ])("%s", (pathname, expected) => {
    expect.hasAssertions();
    expect(checkAppManifestUrl(new URL(pathname, ORIGIN), ORIGIN)).toBe(expected);
  });

  test("a manifest on another origin is not one", () => {
    expect.hasAssertions();
    expect(checkAppManifestUrl(new URL("/_nuxt/builds/latest.json", OTHER_ORIGIN), ORIGIN)).toBe(false);
  });
});
