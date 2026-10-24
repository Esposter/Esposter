import { relativizeOwnAssetUrls } from "#server/services/resource/relativizeOwnAssetUrls";
import { TEST_ORIGIN, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { afterEach, describe, expect, test, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe(relativizeOwnAssetUrls, () => {
  test("an asset url of our own origin is made local", () => {
    expect.hasAssertions();

    vi.stubEnv("BASE_URL", TEST_ORIGIN);
    const assetUrl = `${RESOURCE_ASSETS_URL_PREFIX}/a`;

    expect(relativizeOwnAssetUrls(`${TEST_ORIGIN}${assetUrl}`)).toBe(assetUrl);
  });

  test("a foreign url that embeds our origin's asset url is left as it is", () => {
    expect.hasAssertions();

    vi.stubEnv("BASE_URL", TEST_ORIGIN);
    const foreignUrl = `${TEST_URL}${TEST_ORIGIN}${RESOURCE_ASSETS_URL_PREFIX}/a`;

    expect(relativizeOwnAssetUrls(foreignUrl)).toBe(foreignUrl);
  });
});
