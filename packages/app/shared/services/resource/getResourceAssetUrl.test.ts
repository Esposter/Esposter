import { RESOURCE_ASSET_URL_REGEX, RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getResourceAssetUrl, () => {
  const resourceId = crypto.randomUUID();

  test("should encode delimiter characters into the closed charset", () => {
    expect.hasAssertions();

    expect(getResourceAssetUrl(`${resourceId}/files/abc|a !'()*.png`)).toBe(
      `${RESOURCE_ASSETS_URL_PREFIX}/${resourceId}/files/abc%7Ca%20%21%27%28%29%2A.png`,
    );
  });

  test("should encode unicode filenames", () => {
    expect.hasAssertions();

    expect(getResourceAssetUrl(`${resourceId}/files/abc|图.png`)).toBe(
      `${RESOURCE_ASSETS_URL_PREFIX}/${resourceId}/files/abc%7C%E5%9B%BE.png`,
    );
  });

  test("should emit urls the search regex matches fully", () => {
    expect.hasAssertions();

    const url = getResourceAssetUrl(`${resourceId}/files/abc|photo (1).png`);
    const match = takeOne([...`"${url}"`.matchAll(RESOURCE_ASSET_URL_REGEX)]);

    expect(match[0]).toBe(url);
  });

  test("should round-trip through the parser", () => {
    expect.hasAssertions();

    const blobName = `${resourceId}/published/2/files/abc|photo (1).png`;
    const url = getResourceAssetUrl(blobName);

    expect(parseResourceAssetPath(url.slice(`${RESOURCE_ASSETS_URL_PREFIX}/`.length))).toStrictEqual({
      blobName,
      isPublished: true,
      resourceId,
    });
  });
});
