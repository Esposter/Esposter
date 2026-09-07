import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import {
  FILES_DIRECTORY_SEGMENT,
  RESOURCE_ASSET_URL_REGEX,
  RESOURCE_ASSETS_URL_PREFIX,
} from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getResourceAssetUrl, () => {
  const resourceId = crypto.randomUUID();

  test("should encode delimiter characters into the closed charset", () => {
    expect.hasAssertions();

    expect(getResourceAssetUrl(`${getFilesDirectoryName(resourceId)}/a${ID_SEPARATOR}a !'()*`)).toBe(
      `${RESOURCE_ASSETS_URL_PREFIX}/${getFilesDirectoryName(resourceId)}/a%7Ca%20%21%27%28%29%2A`,
    );
  });

  test("should encode unicode filenames", () => {
    expect.hasAssertions();

    expect(getResourceAssetUrl(`${getFilesDirectoryName(resourceId)}/图`)).toBe(
      `${RESOURCE_ASSETS_URL_PREFIX}/${getFilesDirectoryName(resourceId)}/%E5%9B%BE`,
    );
  });

  test("should emit urls the search regex matches fully", () => {
    expect.hasAssertions();

    const url = getResourceAssetUrl(`${getFilesDirectoryName(resourceId)}/a${ID_SEPARATOR}a (1)`);
    const match = takeOne([...`"${url}"`.matchAll(RESOURCE_ASSET_URL_REGEX)]);

    expect(match[0]).toBe(url);
  });

  // Authored content can embed a foreign absolute url whose own path carries this prefix; matching its tail
  // Rewrites it to a local blob on publish and splices a second url into the middle of it on export
  test("should not match the prefix inside another url", () => {
    expect.hasAssertions();

    const url = getResourceAssetUrl(`${getFilesDirectoryName(resourceId)}/a`);

    expect([...`"https://a.com${url}"`.matchAll(RESOURCE_ASSET_URL_REGEX)]).toStrictEqual([]);
  });

  test("should round-trip through the parser", () => {
    expect.hasAssertions();

    const blobName = `${resourceId}/${SnapshotChannel.Published}/${crypto.randomUUID()}/${FILES_DIRECTORY_SEGMENT}/a${ID_SEPARATOR}a (1)`;
    const url = getResourceAssetUrl(blobName);

    expect(parseResourceAssetPath(url.slice(`${RESOURCE_ASSETS_URL_PREFIX}/`.length))).toStrictEqual({
      blobName,
      isPublished: true,
      resourceId,
    });
  });
});
